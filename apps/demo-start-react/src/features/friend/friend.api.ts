import { and, desc, eq, or, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import z from 'zod';
import { type Db, db } from '#/db.server';
import { _createSingleDm } from '#/features/channel/channel.func';
import {
	_createFriend,
	_sendFriendRequest,
} from '#/features/friend/friend.func';
import {
	friendRequestTable,
	friendTable,
	friendTagTable,
} from '#/features/friend/friend.table';
import { friendTag } from '#/features/friend/friendTag.rpc.ts';
import { userItemFields } from '#/features/user/user.schema';
import { user } from '#/lib/auth/auth.table.ts';
import { authFn, getAuthFn } from '#/orpc.base';

// R
const getFriend = getAuthFn
	.input(z.object({ id: z.string().min(1) }))
	.handler(async ({ input, context, errors }) => {
		const [ret] = await db
			.select()
			.from(friendTable)
			.where(
				and(
					eq(friendTable.userId, context.user.id),
					eq(friendTable.friendId, input.id),
				),
			);
		if (!ret) return null;
		return ret;
	});

export const _removeFriend = async (authId: string, userId: string) => {
	await db
		.delete(friendTable)
		.where(
			or(
				and(eq(friendTable.userId, authId), eq(friendTable.friendId, userId)),
				and(eq(friendTable.userId, authId), eq(friendTable.friendId, userId)),
			),
		);
};
const removeFriend = authFn
	.input(z.object({ userId: z.string().min(1) }))
	.handler(({ input, context }) =>
		_removeFriend(context.user.id, input.userId),
	);

export const friend = {
	getFriend,
	select: getAuthFn.handler(({ context }) =>
		db
			.select()
			.from(friendTable)
			.where(eq(friendTable.userId, context.user.id)),
	),
	removeFriend,
};
