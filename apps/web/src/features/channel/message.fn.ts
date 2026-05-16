import { generateTxId } from '@repo/shared/db/genTxid';
import { and, eq } from 'drizzle-orm';
import { db } from '#/db/server.ts';
import {
	channelTable,
	dmMemberTable,
	messageTable,
} from '#/features/channel/channel.table';
import {
	deleteMessageSchema,
	sendMessageSchema,
	updateMessageSchema,
} from '#/features/channel/message.schema';
import { authFn } from '#/lib/middleware/func.ts';

export const sendMessage = authFn
	.inputValidator(sendMessageSchema)
	.handler(async ({ data, context }) => {
		const userId = context.user.id;

		// 权限校验
		if (data.channel_id) {
			const [channel] = await db
				.select()
				.from(channelTable)
				.where(eq(channelTable.id, data.channel_id))
				.limit(1);
			if (!channel) throw new Error('Channel not found');
			if (channel.is_private) {
				// 私有频道：检查是否是实体的成员
				// TODO: 引入实体成员表后改为查询成员表
				if (channel.entity_type !== 'user' || channel.entity_id !== userId) {
					throw new Error('Not a member of this private channel entity');
				}
			}
		} else if (data.room_id) {
			const [member] = await db
				.select()
				.from(dmMemberTable)
				.where(
					and(
						eq(dmMemberTable.room_id, data.room_id),
						eq(dmMemberTable.user_id, userId),
					),
				)
				.limit(1);
			if (!member) throw new Error('Not a member of this DM room');
		}

		return db.transaction(async (tx) => {
			const txid = await generateTxId(tx);
			const [newMessage] = await tx
				.insert(messageTable)
				.values({ ...data, user_id: userId })
				.returning({ id: messageTable.id });
			return { txid, item: newMessage };
		});
	});

export const updateMessage = authFn
	.inputValidator(updateMessageSchema)
	.handler(async ({ data }) =>
		db.transaction(async (tx) => {
			const txid = await generateTxId(tx);
			const { id, ...updateData } = data;
			const [updated] = await tx
				.update(messageTable)
				.set({ ...updateData, is_edited: true })
				.where(eq(messageTable.id, id))
				.returning({ id: messageTable.id });
			return { txid, item: updated };
		}),
	);

export const deleteMessage = authFn
	.inputValidator(deleteMessageSchema)
	.handler(async ({ data }) =>
		db.transaction(async (tx) => {
			const txid = await generateTxId(tx);
			await tx.delete(messageTable).where(eq(messageTable.id, data.id));
			return { txid };
		}),
	);
