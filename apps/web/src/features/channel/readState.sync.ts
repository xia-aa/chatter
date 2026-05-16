import { createShapeOptions } from '@repo/shared/integrations/electric/utils';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { createCollection, type InferCollectionType } from '@tanstack/solid-db';
// 导入服务器函数
import { deleteReadState, upsertReadState } from './readState.fn';
import { readStateSchema } from './readState.schema';

export const readStateCollect = createCollection(
	electricCollectionOptions({
		id: 'read_state',
		syncMode: 'progressive',
		shapeOptions: createShapeOptions('read_state'),
		schema: readStateSchema,
		getKey: (item) => `${item.user_id}_${item.target_type}_${item.target_id}`,
		onInsert: async ({ transaction }) => {
			const { modified } = transaction.mutations[0];
			const ret = await upsertReadState({ data: modified });
			return { txid: ret.txid };
		},
		onUpdate: async ({ transaction }) => {
			const { modified } = transaction.mutations[0];
			const ret = await upsertReadState({ data: modified });
			return { txid: ret.txid };
		},
		onDelete: async ({ transaction }) => {
			const { original } = transaction.mutations[0];
			const ret = await deleteReadState({
				data: {
					userId: original.user_id,
					targetType: original.target_type,
					targetId: original.target_id,
				},
			});
			return { txid: ret.txid };
		},
	}),
);

export type ReadStateRow = InferCollectionType<typeof readStateCollect>;
