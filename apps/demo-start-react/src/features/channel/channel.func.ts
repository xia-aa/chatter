'use server';

import { and, desc, eq, getTableColumns, ne } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { pickColumns } from '#/db.helpers';
import { type Db, db, type Tx } from '#/db.server';
import type {
	InsertChannel,
	InsertDmMember,
	InsertDmRoom,
} from '#/features/channel/channel.schema';
import {
	channelTable,
	dmMemberTable,
	dmRoomTable,
	messageTable,
} from '#/features/channel/channel.table';
import { userItemFields } from '#/features/user/user.schema';
import { user } from '#/lib/auth/auth.table.ts';

export const insertChannel = async (db: Db, data: InsertChannel[]) =>
	await db.insert(channelTable).values(data).returning();

export const insertDmRoom = async (db: Db, data: InsertDmRoom[]) =>
	await db.insert(dmRoomTable).values(data).returning();

export const insertDmMember = async (db: Db, data: InsertDmMember[]) =>
	await db.insert(dmMemberTable).values(data).returning();

export const __createSingleDm = async (
	tx: Tx,
	user1Id: string,
	user2Id: string,
) => {
	const [newRoom] = await insertDmRoom(tx, [{ type: 'single' }]);
	await insertDmMember(tx, [
		{ room_id: newRoom.id, user_id: user1Id },
		{ room_id: newRoom.id, user_id: user2Id },
	]);
	return newRoom;
};

export const __createGroupDm = async (
	tx: Tx,
	ownerId: string,
	memberIds: string[],
	name?: string,
) => {
	const [newRoom] = await insertDmRoom(tx, [{ type: 'group', name }]);
	const members = [
		{ room_id: newRoom.id, user_id: ownerId, role: 'owner' },
		...memberIds.map((id) => ({
			room_id: newRoom.id,
			user_id: id,
			role: 'member' as const,
		})),
	];
	await insertDmMember(tx, members);
	return newRoom;
};

export const _createSingleDm = async (authId: string, user_id: string) => {
	return await db.transaction(async (tx) => {
		return await __createSingleDm(tx, authId, user_id);
	});
};

export const _createGroupDm = async (
	authId: string,
	memberIds: string[],
	name?: string,
) => {
	return await db.transaction(async (tx) => {
		return await __createGroupDm(tx, authId, memberIds, name);
	});
};

export const _listDmRoom = async (authId: string) => {
	const member = alias(dmMemberTable, 'member');
	const otherMember = alias(dmMemberTable, 'otherMember');

	const rooms = await db
		.select({
			...getTableColumns(dmRoomTable),
			lastMessage: {
				id: messageTable.id,
				content: messageTable.content,
				created_at: messageTable.created_at,
			},
		})
		.from(dmRoomTable)
		.innerJoin(dmMemberTable, eq(dmMemberTable.room_id, dmRoomTable.id))
		.leftJoin(messageTable, and(eq(messageTable.room_id, dmRoomTable.id)))
		.where(eq(dmMemberTable.user_id, authId));

	const dmMembers = await db
		.select({
			room_id: dmMemberTable.room_id,
			user_id: dmMemberTable.user_id,
			role: dmMemberTable.role,
			nickname: dmMemberTable.nickname,
			...pickColumns(user, userItemFields),
		})
		.from(dmMemberTable)
		.innerJoin(user, eq(user.id, dmMemberTable.user_id))
		.where(and(eq(dmMemberTable.user_id, authId)));

	const result = rooms.map((conv) => {
		const members = dmMembers.filter((m) => m.room_id === conv.id);
		const otherMembers = members.filter((m) => m.user_id !== authId);
		const otherMember = otherMembers[0];

		return {
			...conv,
			members: members.map((m) => ({
				user_id: m.user_id,
				role: m.role,
				nickname: m.nickname,
				user: otherMember
					? {
							id: otherMember.user_id,
							displayUsername: otherMember.displayUsername,
							username: otherMember.username,
							image: otherMember.image,
						}
					: null,
			})),
		};
	});

	return result.sort(
		(a, b) =>
			(b.lastMessage?.created_at?.getTime() || 0) -
			(a.lastMessage?.created_at?.getTime() || 0),
	);
};

export type ListDmRoomOut = Awaited<ReturnType<typeof _listDmRoom>>;
