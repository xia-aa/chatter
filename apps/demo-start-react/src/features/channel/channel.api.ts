import { eq } from 'drizzle-orm';
import { db } from '#/db.server';
import {
	deleteChannelIn,
	insertChannelIn,
	updateChannelIn,
} from '#/features/channel/channel.schema';
import { channelTable } from '#/features/channel/channel.table';
import { generateTxId } from '#/integrations/electric/genTxid';
import { authFn, getAuthFn } from '#/orpc.base';

// 返回所有频道到客户端 collection，客户端通过 .where() 按需过滤
// 注意：数据量超过 1000-5000 条时应改为参数化查询（如 { entityType, entityId } 或游标分页）
const selectChannel = getAuthFn.handler(() => db.select().from(channelTable));

const insertChannel = authFn.input(insertChannelIn).handler(async ({ input }) =>
	db.transaction(async (tx) => {
		const txid = await generateTxId(tx);
		const [newChannel] = await tx
			.insert(channelTable)
			.values(input)
			.returning();
		return { txid, item: newChannel };
	}),
);

const updateChannel = authFn.input(updateChannelIn).handler(async ({ input }) =>
	db.transaction(async (tx) => {
		const txid = await generateTxId(tx);
		const { id, ...updateData } = input;
		const [updated] = await tx
			.update(channelTable)
			.set(updateData)
			.where(eq(channelTable.id, id))
			.returning();
		return { txid, item: updated };
	}),
);

const deleteChannel = authFn.input(deleteChannelIn).handler(async ({ input }) =>
	db.transaction(async (tx) => {
		const txid = await generateTxId(tx);
		await tx.delete(channelTable).where(eq(channelTable.id, input.id));
		return { txid };
	}),
);

export const channelApi = {
	select: selectChannel,
	insert: insertChannel,
	update: updateChannel,
	delete: deleteChannel,
};
