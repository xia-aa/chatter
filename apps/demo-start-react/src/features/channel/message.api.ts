import { and, eq } from 'drizzle-orm';
import { db } from '#/db.server';
import {
	channelTable,
	dmMemberTable,
	messageTable,
} from '#/features/channel/channel.table';
import {
	deleteMessageIn,
	sendMessageIn,
	updateMessageIn,
} from '#/features/channel/message.schema';
import { generateTxId } from '#/integrations/electric/genTxid';
import { authFn } from '#/orpc.base';

const sendMessage = authFn
	.input(sendMessageIn)
	.handler(async ({ input, context, errors }) => {
		const userId = context.user.id;

		// 权限校验
		if (input.channel_id) {
			const [channel] = await db
				.select()
				.from(channelTable)
				.where(eq(channelTable.id, input.channel_id))
				.limit(1);
			if (!channel) throw errors.NOT_FOUND({ message: 'Channel not found' });
			if (channel.is_private) {
				// 私有频道：检查是否是实体的成员
				// TODO: 引入实体成员表后改为查询成员表
				if (channel.entity_type !== 'user' || channel.entity_id !== userId) {
					throw errors.FORBIDDEN({ message: 'Not a member of this private channel entity' });
				}
			}
		} else if (input.room_id) {
			const [member] = await db
				.select()
				.from(dmMemberTable)
				.where(
					and(
						eq(dmMemberTable.room_id, input.room_id),
						eq(dmMemberTable.user_id, userId),
					),
				)
				.limit(1);
			if (!member) throw errors.FORBIDDEN({ message: 'Not a member of this DM room' });
		}

		return db.transaction(async (tx) => {
			const txid = await generateTxId(tx);
			const [newMessage] = await tx
				.insert(messageTable)
				.values({ ...input, user_id: userId })
				.returning({ id: messageTable.id });
			return { txid, item: newMessage };
		});
	});

const updateMessage = authFn.input(updateMessageIn).handler(async ({ input }) =>
	db.transaction(async (tx) => {
		const txid = await generateTxId(tx);
		const { id, ...updateData } = input;
		const [updated] = await tx
			.update(messageTable)
			.set({ ...updateData, is_edited: true })
			.where(eq(messageTable.id, id))
			.returning({ id: messageTable.id });
		return { txid, item: updated };
	}),
);

const deleteMessage = authFn.input(deleteMessageIn).handler(async ({ input }) =>
	db.transaction(async (tx) => {
		const txid = await generateTxId(tx);
		await tx.delete(messageTable).where(eq(messageTable.id, input.id));
		return { txid };
	}),
);

export const messageApi = {
	send: sendMessage,
	update: updateMessage,
	delete: deleteMessage,
};
