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
	acceptFriendRequestIn,
	sendFriendRequestIn,
} from '#/features/friend/friend.schema';
import {
	friendRequestTable,
	friendTable,
} from '#/features/friend/friend.table';
import { userItemFields } from '#/features/user/user.schema';
import { user } from '#/lib/auth/auth.table.ts';
import { authFn, getAuthFn } from '#/orpc.base';

const listFriendRequest = getAuthFn.handler(async ({ context, errors }) => {
	const authId = context.user.id;
	const userEmitter = alias(user, 'user_emitter');
	const userReceiver = alias(user, 'user_receiver');
	const friendRequestList = await db
		.select({
			id: friendRequestTable.id,
			emitter_id: friendRequestTable.emitter_id,
			receiver_id: friendRequestTable.receiver_id,
			status: friendRequestTable.status,
			message: friendRequestTable.message,
			created_at: friendRequestTable.created_at,
			updated_at: friendRequestTable.updated_at,
			user: {
				id: sql<string>`COALESCE(
          CASE WHEN ${friendRequestTable.emitter_id} = ${authId} THEN ${userReceiver.id}
              ELSE ${userEmitter.id}
          END
        )`.as('id'),
				username: sql<string>`COALESCE(
          CASE WHEN ${friendRequestTable.emitter_id} = ${authId} THEN ${userReceiver.username}
              ELSE ${userEmitter.username}
          END
        )`.as('username'),
				displayUsername: sql<string>`COALESCE(
          CASE WHEN ${friendRequestTable.emitter_id} = ${authId} THEN ${userReceiver.displayUsername}
              ELSE ${userEmitter.displayUsername}
          END
        )`.as('displayUsername'),

				image: sql<string>`COALESCE(
          CASE WHEN ${friendRequestTable.emitter_id} = ${authId} THEN ${userReceiver.image}
              ELSE ${userEmitter.image}
          END
        )`.as('avatar'),
			},
		})
		.from(friendRequestTable)
		.leftJoin(userEmitter, eq(friendRequestTable.emitter_id, userEmitter.id))
		.leftJoin(userReceiver, eq(friendRequestTable.receiver_id, userReceiver.id))
		.where(
			or(
				eq(friendRequestTable.emitter_id, authId),
				and(
					eq(friendRequestTable.receiver_id, authId),
					eq(friendRequestTable.status, 'pending'),
				),
			),
		)
		.orderBy(desc(friendRequestTable.created_at));
	//
	return friendRequestList;
});
const sendFriendRequest = authFn
	.input(sendFriendRequestIn)
	.handler(async ({ context, input, errors }) => {
		// 检查是否已经有好友关系或待处理的请求
		const friendRecord = await db
			.select()
			.from(friendTable)
			.where(
				and(
					eq(friendTable.userId, context.user.id),
					eq(friendTable.friendId, input.receiver_id),
				),
			)
			.limit(1);
		if (friendRecord.length > 0)
			throw errors.BAD_REQUEST({ message: '已经是好友了' });
		// 检查是否已有 pending 请求
		const existingPending = await db
			.select()
			.from(friendRequestTable)
			.where(
				and(
					eq(friendRequestTable.emitter_id, context.user.id),
					eq(friendRequestTable.receiver_id, input.receiver_id),
					// inArray(friendRequest.status, ['pending', 'rejected'])
				),
			)
			.limit(1);
		if (existingPending.length > 0 && existingPending[0].status === 'pending') {
			throw errors.BAD_REQUEST({ message: '请求已发送，等待对方回应' });
		}

		return await db.transaction(async (tx) => {
			// 插入或更新好友请求
			const [friendItem] = await _sendFriendRequest(tx, context.user.id, input);
			// let friendGroupId = await tx.query.friendGroup
			//   .findFirst({
			//     where: and(eq(friendGroup.userId, id), eq(friendGroup.name, data.groupName)),
			//   })
			//   .then(group => group?.id)
			// if (!friendGroupId) {
			//   const newGroup = await __createGroup(authId, groupName, tx)
			//   friendGroupId = newGroup.id
			// }
			// await tx.insert(friendGroupLink).values({
			//   friendGroupId,
			//   friendId: friendItem.id,
			// })

			// notify
			// const [newNotify] = await tx
			//   .insert(notify)
			//   .values(
			//     buildNotifyInsert('friend_request', id, {
			//       targetId,
			//       friendTableId: friendItem.id,
			//       username: username!,
			//       image,
			//       msg: data.message,
			//     }),
			//   )
			//   .returning()
			// await tx.insert(notifyReceiver).values({
			//   notifyId: newNotify.id,
			//   userId: targetId,
			// })
			// const wsIds = listWsByUser(targetId)
			// if (wsIds) {
			//   io?.to(wsIds).emit('friend_request', {
			//     senderId: id,
			//     friendTableId: friendItem.id,
			//     username: username!,
			//     image,
			//     msg: data.message,
			//   })
			// }
			return friendItem;
		});
	});
const rejectFriendRequest = authFn
	.input(z.object({ id: z.string().min(1) }))
	.handler(async ({ input, context, errors }) => {
		// 更新请求状态为 rejected
		await db
			.update(friendRequestTable)
			.set({
				status: 'rejected',
			})
			.where(eq(friendRequestTable.id, input.id));
		return { message: '成功' };
	});
const acceptFriendRequest = authFn.input(acceptFriendRequestIn).handler(
	async ({ input, context, errors }) =>
		await db.transaction(async (tx) => {
			// 更新现有请求状态为accepted
			const [friendRequestItem] = await tx
				.update(friendRequestTable)
				.set({
					status: 'accepted',
					accepted_at: new Date().toISOString(),
				})
				.where(
					and(
						eq(friendRequestTable.id, input.id),
						eq(friendRequestTable.receiver_id, context.user.id),
						eq(friendRequestTable.status, 'pending'),
					),
				)
				.returning({
					emitter_id: friendRequestTable.emitter_id,
					receiver_id: friendRequestTable.receiver_id,
					nickname: friendRequestTable.nickname,
					tags: friendRequestTable.tags,
				});
			if (!friendRequestItem) {
				throw errors.NOT_FOUND({ message: '没有找到对应的好友请求' });
			}
			await _createFriend(tx, friendRequestItem);
			// 创建私聊频道
			await _createSingleDm(friendRequestItem.emitter_id, context.user.id);
			return friendRequestItem;
		}),
);
export const friendRequest = {
	select: listFriendRequest,
	send: sendFriendRequest,
	reject: rejectFriendRequest,
	accept: acceptFriendRequest,
};
