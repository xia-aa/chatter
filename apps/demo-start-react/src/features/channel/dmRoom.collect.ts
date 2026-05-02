import { queryCollectionOptions } from '@tanstack/query-db-collection';
import { createCollection, type InferCollectionType } from '@tanstack/react-db';
import { getContextQC } from '#/integrations/tanstack-query/provider.ts';
import { orpc } from '#/orpc._client.ts';
import { selectDmRoomZ } from './channel.schema';

export const dmRoomCollect = createCollection(
	(queryCollectionOptions as any)({
		id: 'dm_room',
		queryClient: getContextQC(),
		syncMode: 'on-demand',
		...orpc.dmRoom.select.queryOptions(),
		schema: selectDmRoomZ,
		getKey: (item: any) => item.id as string,
		onInsert: async ({ transaction }: any) => {
			const { modified } = transaction.mutations[0];
			await orpc.dmRoom.insert.call(modified as any);
		},
		onUpdate: async ({ transaction }: any) => {
			const { modified } = transaction.mutations[0];
			await orpc.dmRoom.update.call(modified as any);
		},
		onDelete: async ({ transaction }: any) => {
			const { original } = transaction.mutations[0];
			await orpc.dmRoom.delete.call({ id: original.id as string });
		},
	}),
);

export type DmRoomRow = InferCollectionType<typeof dmRoomCollect>;
