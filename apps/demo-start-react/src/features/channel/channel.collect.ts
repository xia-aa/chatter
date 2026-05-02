import { queryCollectionOptions } from '@tanstack/query-db-collection';
import { createCollection, type InferCollectionType } from '@tanstack/react-db';
import { getContextQC } from '#/integrations/tanstack-query/provider.ts';
import { orpc } from '#/orpc._client.ts';
import { selectChannelZ } from './channel.schema';

export const channelCollect = createCollection(
	queryCollectionOptions({
		id: 'channel',
		queryClient: getContextQC(),
		syncMode: 'on-demand',
		...orpc.channel.select.queryOptions(),
		schema: selectChannelZ,
		getKey: (item) => item.id,
		onInsert: async ({ transaction }) => {
			const { modified } = transaction.mutations[0];
			await orpc.channel.insert.call(modified);
		},
		onUpdate: async ({ transaction }) => {
			const { modified } = transaction.mutations[0];
			await orpc.channel.update.call(modified);
		},
		onDelete: async ({ transaction }) => {
			const { original } = transaction.mutations[0];
			await orpc.channel.delete.call({ id: original.id });
		},
	}),
);

export type ChannelRow = InferCollectionType<typeof channelCollect>;
