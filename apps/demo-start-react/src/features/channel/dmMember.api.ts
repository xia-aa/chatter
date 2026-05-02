import { eq } from 'drizzle-orm';
import { db } from '#/db.server';
import {
	deleteDmMemberIn,
	insertDmMemberIn,
	updateDmMemberIn,
} from '#/features/channel/channel.schema';
import { dmMemberTable } from '#/features/channel/channel.table';
import { generateTxId } from '#/integrations/electric/genTxid';
import { authFn, getAuthFn } from '#/orpc.base';

const selectDmMember = getAuthFn.handler(({ context }) =>
	db
		.select()
		.from(dmMemberTable)
		.where(eq(dmMemberTable.user_id, context.user.id)),
);

const insertDmMember = authFn
	.input(insertDmMemberIn)
	.handler(async ({ input }) =>
		db.transaction(async (tx) => {
			const txid = await generateTxId(tx);
			const [newMember] = await tx
				.insert(dmMemberTable)
				.values(input)
				.returning();
			return { txid, item: newMember };
		}),
	);

const updateDmMember = authFn
	.input(updateDmMemberIn)
	.handler(async ({ input }) =>
		db.transaction(async (tx) => {
			const txid = await generateTxId(tx);
			const { id, ...updateData } = input;
			const [updated] = await tx
				.update(dmMemberTable)
				.set(updateData)
				.where(eq(dmMemberTable.id, id))
				.returning();
			return { txid, item: updated };
		}),
	);

const deleteDmMember = authFn
	.input(deleteDmMemberIn)
	.handler(async ({ input }) =>
		db.transaction(async (tx) => {
			const txid = await generateTxId(tx);
			await tx.delete(dmMemberTable).where(eq(dmMemberTable.id, input.id));
			return { txid };
		}),
	);

export const dmMemberApi = {
	select: selectDmMember,
	insert: insertDmMember,
	update: updateDmMember,
	delete: deleteDmMember,
};
