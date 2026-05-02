import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { createCollection, type InferCollectionType } from '@tanstack/react-db';
import { getUrlStr } from '#/env.url.ts';
import { createShapeOptions } from '#/integrations/electric/utils.ts';
import { orpc } from '#/orpc._client.ts';
import { selectMessageZ } from './message.schema';

export const messageCollect = createCollection(
	electricCollectionOptions({
		schema: selectMessageZ,
		id: 'message',
		shapeOptions: createShapeOptions('message'),
		getKey: (item) => item.id,
		syncMode: 'progressive',
		onInsert: async ({ transaction }) => {
			const { modified } = transaction.mutations[0];
			const ret = await orpc.message.send.call(modified);
			return { txid: ret.txid };
		},
		onUpdate: async ({ transaction }) => {
			const { modified } = transaction.mutations[0];
			const ret = await orpc.message.update.call({
				id: modified.id,
				content: modified.content,
			});
			return { txid: ret.txid };
		},
		onDelete: async ({ transaction }) => {
			const { original } = transaction.mutations[0];
			const ret = await orpc.message.delete.call({ id: original.id as string });
			return { txid: ret.txid };
		},
	}),
);
export type MessageRow = InferCollectionType<typeof messageCollect>;
