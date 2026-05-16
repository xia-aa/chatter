import { getQueryClient } from '@repo/shared/integrations/tanstack-query/provider';
import {
	parseLoadSubsetOptions,
	parseOrderByExpression,
	parseWhereExpression,
	queryCollectionOptions,
} from '@tanstack/query-db-collection';
import {
	and,
	BasicIndex,
	createCollection,
	createLiveQueryCollection,
	createOptimisticAction,
	eq,
	type InferCollectionType,
	type InitialQueryBuilder,
	inArray,
	not,
	or,
	Query,
	queryOnce,
} from '@tanstack/solid-db';
import {
	type DmMemberRow,
	dmMemberCollect,
	dmMemberOptions,
} from '#/features/channel/dmMember.sync.ts';
import {
	type MessageRow,
	messageCollect,
} from '#/features/channel/message.sync.ts';
// 导入服务器函数
import {
	deleteDmRoom,
	insertDmRoom,
	selectDmRoom,
	updateDmRoom,
} from './dmRoom.fn';

export const dmRoomCollect = createCollection(
	queryCollectionOptions({
		id: 'dm_room',
		queryKey: ['dm_room'],
		queryClient: getQueryClient(),
		syncMode: 'on-demand',
		queryFn: async ({ queryKey, meta, pageParam }) => {
			return await selectDmRoom();
		},
		getKey: (item) => item.id,
		onInsert: async ({ transaction }) => {
			const { modified } = transaction.mutations[0];
			await insertDmRoom({ data: modified });
		},
		onUpdate: async ({ transaction }) => {
			const { changes, modified } = transaction.mutations[0];
			await updateDmRoom({ data: { ...changes, id: modified.id } });
		},
		onDelete: async ({ transaction }) => {
			const { original } = transaction.mutations[0];
			await deleteDmRoom({ data: { id: original.id } });
		},
	}),
);
export type DmRoomRow = InferCollectionType<typeof dmRoomCollect>;

export const dmRoomOptions = {
	list: () =>
		createLiveQueryCollection((q) =>
			q
				.from({ dmRoom: dmRoomCollect })
				.leftJoin({ msg: messageCollect }, ({ msg, dmRoom }) =>
					eq(msg.room_id, dmRoom.id),
				)
				.select(({ dmRoom, msg }) => ({
					...dmRoom,
					lastMessage: msg,
					members: q
						.from({ dmMember: dmMemberCollect })
						.where(({ dmMember }) => eq(dmMember.room_id, dmRoom.id)),
				})),
		),
};
export type DmRoomListItem = InferCollectionType<
	ReturnType<typeof dmRoomOptions.list>
>;
