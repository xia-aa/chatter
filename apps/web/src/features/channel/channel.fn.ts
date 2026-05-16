import { generateTxId } from '@repo/shared/db/genTxid';
import { aq } from 'agnostic-query';
import { toDrizzle } from 'agnostic-query/drizzle/pg.js';
import { createQuerySchema } from 'agnostic-query/zod.js';
import { eq, type SQL } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '#/db/server.ts';
import {
	deleteChannelSchema,
	insertChannelSchema,
	updateChannelSchema,
} from '#/features/channel/channel.schema';
import { _insertChannel } from '#/features/channel/channel.server.ts';
import { channelTable } from '#/features/channel/channel.table';
import { authFn, getAuthOrNoFn } from '#/lib/middleware/func.ts';

export type Channel = typeof channelTable.$inferSelect;

export const selectChannel = getAuthOrNoFn
	.inputValidator(createQuerySchema<Channel>())
	.handler(async ({ data, context }) => {
		// 已登录: TODO: 需要根据权限控制能看到哪些频道，目前先不实现
		// 未登录: 只能查看公共频道（is_private = false）
		const _data = context.user
			? data
			: aq(data).where('is_private', '=', false).toJSON();
		return await toDrizzle(db, channelTable, _data);
	});

// 创建频道
export const insertChannel = authFn
	.inputValidator(insertChannelSchema)
	.handler(async ({ data }) =>
		db.transaction(async (tx) => {
			const txid = await generateTxId(tx);
			const [newChannel] = await _insertChannel(tx, [data]);
			return { txid, item: newChannel };
		}),
	);

export const updateChannel = authFn
	.inputValidator(updateChannelSchema)
	.handler(async ({ data }) =>
		db.transaction(async (tx) => {
			const txid = await generateTxId(tx);
			const { id, ...updateData } = data;
			const [updated] = await tx
				.update(channelTable)
				.set(updateData)
				.where(eq(channelTable.id, id))
				.returning();
			return { txid, item: updated };
		}),
	);

export const deleteChannel = authFn
	.inputValidator(deleteChannelSchema)
	.handler(async ({ data }) =>
		db.transaction(async (tx) => {
			const txid = await generateTxId(tx);
			await tx.delete(channelTable).where(eq(channelTable.id, data.id));
			return { txid };
		}),
	);
