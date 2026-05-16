import { generateTxId } from '@repo/shared/db/genTxid';
import { and, eq } from 'drizzle-orm';
import { db } from '#/db/server.ts';
import { readStateTable } from '#/features/channel/channel.table';
import {
	deleteReadStateSchema,
	upsertReadStateSchema,
} from '#/features/channel/readState.schema';
import { authFn } from '#/lib/middleware/func.ts';

export const upsertReadState = authFn
	.inputValidator(upsertReadStateSchema)
	.handler(async ({ data }) =>
		db.transaction(async (tx) => {
			const txid = await generateTxId(tx);
			const [result] = await tx
				.insert(readStateTable)
				.values(data)
				.onConflictDoUpdate({
					target: [
						readStateTable.user_id,
						readStateTable.target_type,
						readStateTable.target_id,
					],
					set: { last_read_message_id: data.last_read_message_id },
				})
				.returning();
			return { txid, item: result };
		}),
	);

export const deleteReadState = authFn
	.inputValidator(deleteReadStateSchema)
	.handler(async ({ data }) =>
		db.transaction(async (tx) => {
			const txid = await generateTxId(tx);
			await tx
				.delete(readStateTable)
				.where(
					and(
						eq(readStateTable.user_id, data.userId),
						eq(readStateTable.target_type, data.targetType),
						eq(readStateTable.target_id, data.targetId),
					),
				);
			return { txid };
		}),
	);
