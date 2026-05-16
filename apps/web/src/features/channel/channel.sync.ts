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
	type ExtractContext,
	eq,
	type InferCollectionType,
	type InferResultType,
	type InitialQueryBuilder,
	inArray,
	not,
	or,
	Query,
	type QueryBuilder,
	queryOnce,
} from '@tanstack/solid-db';
import { fromTanDb } from 'agnostic-query/tanstack-db.js';
// 导入服务器函数
import {
	type Channel,
	deleteChannel,
	insertChannel,
	selectChannel,
	updateChannel,
} from '#/features/channel/channel.fn.ts';
import {
	channelSchema,
	type ListChannelIn,
} from '#/features/channel/channel.schema';

export const channelCollect = createCollection(
	queryCollectionOptions({
		queryKey: ['channel'],
		queryClient: getQueryClient(),
		schema: channelSchema,
		syncMode: 'on-demand',
		queryFn: async ({ queryKey, meta, pageParam }) => {
			const data = fromTanDb(meta?.loadSubsetOptions);
			return await selectChannel({ data });
		},
		getKey: (item) => item.id,
		onInsert: async ({ transaction }) => {
			const { modified } = transaction.mutations[0];
			await insertChannel({ data: modified });
		},
		onUpdate: async ({ transaction }) => {
			const { changes, modified } = transaction.mutations[0];
			await updateChannel({ data: { ...changes, id: modified.id } });
		},
		onDelete: async ({ transaction }) => {
			const { original } = transaction.mutations[0];
			await deleteChannel({ data: { id: original.id } });
		},
	}),
);

export type ChannelRow = InferCollectionType<typeof channelCollect>;

export const listChannelQ =
	(input: ListChannelIn) => (q: InitialQueryBuilder) =>
		q
			.from({ channel: channelCollect })
			.where(({ channel }) =>
				and(
					eq(channel.entity_type, input.entity_type),
					eq(channel.entity_id, input.entity_id),
				),
			);

export type ListChannel = InferResultType<
	ExtractContext<ReturnType<ReturnType<typeof listChannelQ>>>
>;
