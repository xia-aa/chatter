import { electricCollectionOptions } from '@tanstack/electric-db-collection'
import { createCollection, type InferCollectionType } from '@tanstack/react-db'
import { createShapeOptions } from '#/integrations/electric/utils.ts'
import { orpc } from '#/orpc._client.ts'
import { selectReadStateZ } from './readState.schema'

export const readStateCollect = createCollection(
	(electricCollectionOptions as any)({
		id: 'read_state',
		syncMode: 'progressive',
		shapeOptions: createShapeOptions('read_state'),
		schema: selectReadStateZ,
		getKey: (item: any) => `${item.user_id}_${item.target_type}_${item.target_id}`,
		onInsert: async ({ transaction }: any) => {
			const { modified } = transaction.mutations[0];
			const ret = await orpc.readState.upsert.call(modified);
			return { txid: (ret as any).txid };
		},
		onUpdate: async ({ transaction }: any) => {
			const { modified } = transaction.mutations[0];
			const ret = await orpc.readState.upsert.call(modified);
			return { txid: (ret as any).txid };
		},
		onDelete: async ({ transaction }: any) => {
			const { original } = transaction.mutations[0];
			const ret = await orpc.readState.delete.call({
				userId: original.user_id,
				targetType: original.target_type,
				targetId: original.target_id,
			});
			return { txid: (ret as any).txid };
		},
	}),
);

export type ReadStateRow = InferCollectionType<typeof readStateCollect>;
