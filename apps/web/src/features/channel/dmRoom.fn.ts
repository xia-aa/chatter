import { generateTxId } from '@repo/shared/db/genTxid';
import { eq, getTableColumns } from 'drizzle-orm';
import { db } from '#/db/server.ts';
import {
	deleteDmRoomSchema,
	insertDmRoomSchema,
	updateDmRoomSchema,
} from '#/features/channel/channel.schema';
import { dmMemberTable, dmRoomTable } from '#/features/channel/channel.table';
import { authFn, getAuthFn } from '#/lib/middleware/func.ts';

// 返回用户参与的 DM 房间（通过 dmMember 关联）
export const selectDmRoom = getAuthFn.handler(({ context }) =>
	db
		.select({
			...getTableColumns(dmRoomTable),
		})
		.from(dmRoomTable)
		.innerJoin(dmMemberTable, eq(dmMemberTable.room_id, dmRoomTable.id))
		.where(eq(dmMemberTable.user_id, context.user.id)),
);

export const insertDmRoom = authFn
	.inputValidator(insertDmRoomSchema)
	.handler(async ({ data, context }) => {
		const userId = context.user.id;

		return db.transaction(async (tx) => {
			const txid = await generateTxId(tx);
			const [newRoom] = await tx.insert(dmRoomTable).values(data).returning();

			await tx.insert(dmMemberTable).values({
				room_id: newRoom.id,
				user_id: userId,
				role: 'owner',
			});

			return { txid, item: newRoom };
		});
	});

export const updateDmRoom = authFn
	.inputValidator(updateDmRoomSchema)
	.handler(async ({ data }) =>
		db.transaction(async (tx) => {
			const txid = await generateTxId(tx);
			const { id, ...updateData } = data;
			const [updated] = await tx
				.update(dmRoomTable)
				.set(updateData)
				.where(eq(dmRoomTable.id, id))
				.returning();
			return { txid, item: updated };
		}),
	);

export const deleteDmRoom = authFn
	.inputValidator(deleteDmRoomSchema)
	.handler(async ({ data }) =>
		db.transaction(async (tx) => {
			const txid = await generateTxId(tx);
			await tx.delete(dmRoomTable).where(eq(dmRoomTable.id, data.id));
			return { txid };
		}),
	);
