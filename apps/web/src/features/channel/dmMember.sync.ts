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
import { userCollect } from '#/features/user/user.sync.ts';
import { dmMemberSchema } from './channel.schema';
// 导入服务器函数
import {
	deleteDmMember,
	insertDmMember,
	selectDmMember,
	updateDmMember,
} from './dmMember.fn';

export const dmMemberCollect = createCollection(
	queryCollectionOptions({
		id: 'dm_member',
		queryKey: ['dm_member'],
		queryClient: getQueryClient(),
		schema: dmMemberSchema,
		syncMode: 'on-demand',
		queryFn: async ({ queryKey, meta, pageParam }) => {
			return await selectDmMember();
		},
		getKey: (item) => item.id,
		onInsert: async ({ transaction }) => {
			const { modified } = transaction.mutations[0];
			await insertDmMember({ data: modified });
		},
		onUpdate: async ({ transaction }) => {
			const { changes, modified } = transaction.mutations[0];
			await updateDmMember({ data: { ...changes, id: modified.id } });
		},
		onDelete: async ({ transaction }) => {
			const { original } = transaction.mutations[0];
			await deleteDmMember({ data: { id: original.id } });
		},
	}),
);

export type DmMemberRow = InferCollectionType<typeof dmMemberCollect>;

export const dmMemberOptions = {
	select: (dmRoomId: string) =>
		createLiveQueryCollection((q) =>
			q
				.from({ dmMember: dmMemberCollect })
				.innerJoin({ user: userCollect }, ({ dmMember, user }) =>
					eq(dmMember.user_id, user.id),
				)
				.where(({ dmMember }) => eq(dmMember.room_id, dmRoomId))
				.select(({ dmMember, user }) => ({ ...dmMember, user })),
		),
};
