import { eq } from 'drizzle-orm';
import { getTableColumns } from 'drizzle-orm';
import { db } from '#/db.server';
import {
	deleteDmRoomIn,
	insertDmRoomIn,
	updateDmRoomIn,
} from '#/features/channel/channel.schema';
import { dmMemberTable, dmRoomTable } from '#/features/channel/channel.table';
import { generateTxId } from '#/integrations/electric/genTxid';
import { authFn, getAuthFn } from '#/orpc.base';

// 返回用户参与的 DM 房间（通过 dmMember 关联）
const selectDmRoom = getAuthFn.handler(({ context }) =>
	db
		.select({
			...getTableColumns(dmRoomTable),
		})
		.from(dmRoomTable)
		.innerJoin(
			dmMemberTable,
			eq(dmMemberTable.room_id, dmRoomTable.id),
		)
		.where(eq(dmMemberTable.user_id, context.user.id)),
);

const insertDmRoom = authFn
	.input(insertDmRoomIn)
	.handler(async ({ input, context, errors }) => {
		const userId = context.user.id;

		return db.transaction(async (tx) => {
			const txid = await generateTxId(tx);
			const [newRoom] = await tx
				.insert(dmRoomTable)
				.values(input)
				.returning();

			await tx.insert(dmMemberTable).values({
				room_id: newRoom.id,
				user_id: userId,
				role: 'owner',
			});

			return { txid, item: newRoom };
		});
	});

const updateDmRoom = authFn
	.input(updateDmRoomIn)
	.handler(async ({ input }) =>
		db.transaction(async (tx) => {
			const txid = await generateTxId(tx);
			const { id, ...updateData } = input;
			const [updated] = await tx
				.update(dmRoomTable)
				.set(updateData)
				.where(eq(dmRoomTable.id, id))
				.returning();
			return { txid, item: updated };
		}),
	);

const deleteDmRoom = authFn
	.input(deleteDmRoomIn)
	.handler(async ({ input }) =>
		db.transaction(async (tx) => {
			const txid = await generateTxId(tx);
			await tx.delete(dmRoomTable).where(eq(dmRoomTable.id, input.id));
			return { txid };
		}),
	);

export const dmRoomApi = {
	select: selectDmRoom,
	insert: insertDmRoom,
	update: updateDmRoom,
	delete: deleteDmRoom,
};
