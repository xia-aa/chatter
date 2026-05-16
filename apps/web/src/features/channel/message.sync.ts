import { createShapeOptions } from '@repo/shared/integrations/electric/utils';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import {
	BasicIndex,
	createCollection,
	createLiveQueryCollection,
	eq,
	type InferCollectionType,
	Query,
} from '@tanstack/solid-db';
import { type UserRow, userCollect } from '#/features/user/user.sync.ts';
// 导入服务器函数
import { deleteMessage, sendMessage, updateMessage } from './message.fn';
import { messageSchema } from './message.schema';

export const messageCollect = createCollection(
	electricCollectionOptions({
		schema: messageSchema,
		id: 'message',
		shapeOptions: createShapeOptions('message'),
		getKey: (item) => item.id,
		syncMode: 'progressive',
		onInsert: async ({ transaction }) => {
			const { modified } = transaction.mutations[0];
			const ret = await sendMessage({ data: modified });
			return { txid: ret.txid };
		},
		onUpdate: async ({ transaction }) => {
			const { modified } = transaction.mutations[0];
			const ret = await updateMessage({
				data: { id: modified.id, content: modified.content },
			});
			return { txid: ret.txid };
		},
		onDelete: async ({ transaction }) => {
			const { original } = transaction.mutations[0];
			const ret = await deleteMessage({ data: { id: original.id } });
			return { txid: ret.txid };
		},
		defaultIndexType: BasicIndex,
		autoIndex: 'eager',
	}),
);
export type MessageRow = InferCollectionType<typeof messageCollect>;
// messageCollect.createIndex((row) => row.updated_at, { indexType: BasicIndex });

type MessageTarget =
	| {
			readonly type: 'channel';
			readonly id: string;
	  }
	| {
			readonly type: 'room';
			readonly id: string;
	  }
	| null;
export const messageOpt = {
	list: (target: MessageTarget) =>
		new Query()
			.from({ message: messageCollect })
			// .join({ user: userCollect }, ({ message, user }) =>
			// 	eq(message.user_id, user.id),
			// )
			.where(({ message }) =>
				target
					? target.type === 'channel'
						? eq(message.channel_id, target.id)
						: eq(message.room_id, target.id)
					: undefined,
			)
			.orderBy(({ message }) => message.created_at, 'asc')
			.orderBy(({ message }) => message.id, 'desc'),
	// .select(({ message, user }) => ({
	// 	...message,
	// 	user,
	// })),
};

export type MessageWithUser = MessageRow & { user?: Partial<UserRow> };
