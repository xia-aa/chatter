import { eq } from 'drizzle-orm';
import { db } from '#/db/server.ts';
import {
	deleteDmMemberSchema,
	insertDmMemberSchema,
	updateDmMemberSchema,
} from '#/features/channel/channel.schema';
import { dmMemberTable } from '#/features/channel/channel.table';
import { generateTxId } from '#/integrations/electric/genTxid';
import { authFn, getAuthFn } from '#/lib/middleware/func.ts';

export const selectDmMember = getAuthFn.handler(
	async ({ context }) =>
		await db
			.select()
			.from(dmMemberTable)
			.where(eq(dmMemberTable.user_id, context.user.id)),
);

export const insertDmMember = authFn
	.inputValidator(insertDmMemberSchema)
	.handler(async ({ data }) =>
		db.transaction(async (tx) => {
			const txid = await generateTxId(tx);
			const [newMember] = await tx
				.insert(dmMemberTable)
				.values(data)
				.returning();
			return { txid, item: newMember };
		}),
	);

export const updateDmMember = authFn
	.inputValidator(updateDmMemberSchema)
	.handler(async ({ data }) =>
		db.transaction(async (tx) => {
			const txid = await generateTxId(tx);
			const { id, ...updateData } = data;
			const [updated] = await tx
				.update(dmMemberTable)
				.set(updateData)
				.where(eq(dmMemberTable.id, id))
				.returning();
			return { txid, item: updated };
		}),
	);

export const deleteDmMember = authFn
	.inputValidator(deleteDmMemberSchema)
	.handler(async ({ data }) =>
		db.transaction(async (tx) => {
			const txid = await generateTxId(tx);
			await tx.delete(dmMemberTable).where(eq(dmMemberTable.id, data.id));
			return { txid };
		}),
	);
