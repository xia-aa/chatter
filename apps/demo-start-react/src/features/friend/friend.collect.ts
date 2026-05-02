import { snakeCamelMapper } from '@electric-sql/client';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { queryCollectionOptions } from '@tanstack/query-db-collection';
import {
	and,
	BasicIndex,
	createCollection,
	createLiveQueryCollection,
	createOptimisticAction,
	eq,
	type InferCollectionType,
	queryOnce,
} from '@tanstack/react-db';
import { isServer } from '@tanstack/react-query';
import { createSelectSchema } from 'drizzle-zod';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import {
	type AcceptFriendRequest,
	type RejectFriendRequest,
	type SelectFriendRequest,
	type SendFriendRequest,
	type SendFriendRequestIn,
	selectFriendRequestZ,
	selectFriendTagZ,
	selectFriendZ,
	sendFriendRequestIn,
} from '#/features/friend/friend.schema.ts';
import { userCollect } from '#/features/user/user.collect.ts';
import { selectUserZ } from '#/features/user/user.schema.ts';
import { createShapeOptions } from '#/integrations/electric/utils.ts';
import { getContextQC } from '#/integrations/tanstack-query/provider.ts';
import { orpc } from '#/orpc._client.ts';

export const friendCollect = createCollection(
	queryCollectionOptions({
		id: 'friend',
		schema: selectFriendZ,
		queryClient: getContextQC(),
		syncMode: 'on-demand',
		...orpc.friend.select.queryOptions(),
		getKey: (item) => item.id,
		onInsert: async ({ transaction }) => {},
		onUpdate: async ({ transaction }) => {},
		onDelete: async ({ transaction }) => {},
	}),
);
export type FriendRow = InferCollectionType<typeof friendCollect>;

export const friendRequestCollect = createCollection(
	electricCollectionOptions({
		id: 'friend_request',
		schema: selectFriendRequestZ,
		getKey: (item) => item.id,
		shapeOptions: createShapeOptions('friend_request'),

		syncMode: 'progressive',
		// columnMapper: snakeCamelMapper(), // Column name transformation
		onInsert: async ({ transaction }) => {
			const { modified } = transaction.mutations[0];
			console.log('friendRequestCollect.onInsert', modified);
		},
		onUpdate: async ({ transaction }) => {},
		onDelete: async ({ transaction }) => {},
	}),
);
export type FriendRequestRow = InferCollectionType<typeof friendRequestCollect>;
export const friendRequestOpt = {
	list: (meId: string) =>
		createLiveQueryCollection((q) =>
			q
				.from({ fr: friendRequestCollect })
				.leftJoin({ userEmitter: userCollect }, ({ fr, userEmitter }) =>
					eq(fr.emitter_id, userEmitter.id),
				)
				.leftJoin({ userReceiver: userCollect }, ({ fr, userReceiver }) =>
					eq(fr.receiver_id, userReceiver.id),
				)
				.select(({ fr, userEmitter, userReceiver }) => {
					const user = fr.emitter_id === meId ? userReceiver : userEmitter;
					return { ...fr, user };
				}),
		),
	accept: createOptimisticAction<AcceptFriendRequest>({
		onMutate: (input) => {
			const modified = friendRequestCollect.update(input.id, (draft) => {
				draft.status = 'accepted';
				draft.updated_at = new Date();
			}).mutations[0].modified as SelectFriendRequest;
			friendCollect.insert([
				{
					userId: input.receiver_id,
					friendId: modified.emitter_id,
					nickname: modified.nickname,
				},
				{
					userId: modified.emitter_id,
					friendId: input.receiver_id,
				},
			]);
		},
		mutationFn: async (input) => await orpc.friendRequest.accept.call(input),
	}),
	reject: createOptimisticAction<RejectFriendRequest>({
		onMutate: (input) => {},
		mutationFn: async (input) =>
			await orpc.friendRequest.reject.call({ id: input.id }),
	}),
};
export const sendFriendRequest = createOptimisticAction<SendFriendRequest>({
	onMutate: (input) => {
		console.log('Optimistically sending friend request', input);
		// 乐观更新：先尝试查找
		// const existing = queryOnce((q) =>
		// 	q
		// 		.from({
		// 			fr: friendRequestCollect,
		// 		})
		// 		.where(({ fr }) =>
		// 			and(
		// 				eq(fr.emitterId, input.emitterId),
		// 				eq(fr.receiverId, input.receiverId),
		// 			),
		// 		)
		// 		.select(({ fr }) => ({ id: fr.id }))
		// 		.findOne(),
		// );
		// if (existing) {
		// 	friendRequestCollect.update(existing.id, (draft) => {
		// 		draft.status = 'pending';
		// 		draft.message = input.message;
		// 		draft.nickname = input.nickname;
		// 		draft.tags = input.tags;
		// 	});
		// }
		const tx = friendRequestCollect.insert({
			...input,
			status: 'pending',
		});
	},
	mutationFn: async (input) => await orpc.friendRequest.send.call(input),
});
export const friendTagCollect = createCollection(
	queryCollectionOptions({
		id: 'friend_tag',
		queryClient: getContextQC(),
		syncMode: 'on-demand',
		...orpc.friendTag.select.queryOptions(),
		schema: selectFriendTagZ,
		getKey: (item) => item.id,
		onInsert: async ({ transaction }) => {
			const { modified } = transaction.mutations[0];
			console.log('friendTagCollect.onInsert', modified);
			await orpc.friendTag.insert.call({ name: modified.name });
		},
		onUpdate: async ({ transaction }) => {},
		onDelete: async ({ transaction }) => {},
	}),
);
export type FriendTagRow = InferCollectionType<typeof friendTagCollect>;
