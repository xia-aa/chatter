import { and, eq } from 'drizzle-orm';
import { db } from '#/db.server';
import { readStateTable } from '#/features/channel/channel.table';
import {
	deleteReadStateIn,
	upsertReadStateIn,
} from '#/features/channel/readState.schema';
import { generateTxId } from '#/integrations/electric/genTxid';
import { authFn } from '#/orpc.base';

const upsertReadState = authFn
	.input(upsertReadStateIn)
	.handler(async ({ input }) =>
		db.transaction(async (tx) => {
			const txid = await generateTxId(tx);
			const [result] = await tx
				.insert(readStateTable)
				.values(input)
				.onConflictDoUpdate({
					target: [
						readStateTable.user_id,
						readStateTable.target_type,
						readStateTable.target_id,
					],
					set: { last_read_message_id: input.last_read_message_id },
				})
				.returning();
			return { txid, item: result };
		}),
	);

const deleteReadState = authFn
	.input(deleteReadStateIn)
	.handler(async ({ input }) =>
		db.transaction(async (tx) => {
			const txid = await generateTxId(tx);
			await tx.delete(readStateTable).where(
				and(
					eq(readStateTable.user_id, input.userId),
					eq(readStateTable.target_type, input.targetType),
					eq(readStateTable.target_id, input.targetId),
				),
			);
			return { txid };
		}),
	);

export const readStateApi = {
	upsert: upsertReadState,
	delete: deleteReadState,
};
