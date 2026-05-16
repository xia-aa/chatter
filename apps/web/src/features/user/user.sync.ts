import { getQueryClient } from '@repo/shared/integrations/tanstack-query/provider';
import {
	parseOrderByExpression,
	queryCollectionOptions,
} from '@tanstack/query-db-collection';
import {
	BasicIndex,
	createCollection,
	createLiveQueryCollection,
	createOptimisticAction,
	eq,
	type InferCollectionType,
	type InitialQueryBuilder,
	ilike,
	inArray,
	not,
	or,
	Query,
} from '@tanstack/solid-db';
import type { z } from 'zod';
import { profileCollect } from '#/features/user/profile.sync.ts';
import { editUser, selectUser } from '#/features/user/user.fn.ts';
import type { editUserSchema } from '#/features/user/user.schema.ts';

export const userCollect = createCollection(
	queryCollectionOptions({
		id: 'user',
		syncMode: 'on-demand',
		queryKey: ['user'],
		queryFn: async ({ queryKey, meta, pageParam }) => {
			return await selectUser();
		},
		queryClient: getQueryClient(),
		getKey: (item) => item.id,
	}),
);
export type UserRow = InferCollectionType<typeof userCollect>;

type searchUserIn = {
	keyword?: string;
	meId?: string;
};
export const userOpt = {
	detailQ: (id: string) => (q: InitialQueryBuilder) =>
		q
			.from({ user: userCollect })
			.join({ profile: profileCollect }, ({ user, profile }) =>
				eq(user.id, profile.userId),
			)
			.where(({ user }) => eq(user.id, id))
			.select(({ user, profile }) => ({
				...user,
				profileId: profile.id,
				...profile,
			}))
			.findOne(),
	detail: (id: string) => createLiveQueryCollection(userOpt.detailQ(id)),
	searchQ: ({ keyword, meId }: searchUserIn) => {
		let query = new Query()
			.from({ user: userCollect })
			.where(({ user }) =>
				or(ilike(user.name, keyword), ilike(user.displayUsername, keyword)),
			);
		if (meId) {
			query = query.where(({ user }) => not(eq(user.id, meId)));
		}
		return query.orderBy(({ user }) => user.createdAt, 'desc');
	},
	search: ({ keyword }: searchUserIn) =>
		createLiveQueryCollection((q) => userOpt.searchQ({ keyword })),
	byIds: (ids: string[]) =>
		createLiveQueryCollection(() => {
			let query = new Query().from({ user: userCollect });
			if (ids.length > 0) {
				query = query.where(({ user }) => inArray(user.id, ids));
			}
			return query;
		}),
	edit: createOptimisticAction<
		z.output<typeof editUserSchema> & {
			id: string;
			profileId?: string;
		}
	>({
		onMutate: ({ id, username, displayUsername, name, image, ...input }) => {
			userCollect.update(id, (draft) => {
				if (username) draft.username = username;
				if (displayUsername) draft.displayUsername = displayUsername;
				if (name) {
					draft.name = name;
				} else if (displayUsername) {
					draft.name = displayUsername;
				}
				if (image) draft.image = image;
			});
			if (Object.values(input).some((v) => v !== undefined)) return;
			if (!input.profileId) {
				profileCollect.insert({ ...input, userId: id });
				return;
			}
			profileCollect.update(input.profileId, (draft) => {
				if (input.summary !== undefined) draft.summary = input.summary;
				if (input.color !== undefined) draft.color = input.color;
				if (input.banner !== undefined) draft.banner = input.banner;
				if (input.description !== undefined)
					draft.description = input.description;
			});
		},
		mutationFn: async ({ id, ...data }) => await editUser({ data }),
	}),
};
export const listUserByIdsQ = (ids: string[]) => (q: InitialQueryBuilder) => {
	let query = new Query().from({ user: userCollect });
	if (ids.length > 0) {
		query = query.where(({ user }) => inArray(user.id, ids));
	}
	return query;
};
export type UserRowWithProfile = InferCollectionType<
	ReturnType<typeof userOpt.detail>
>;
