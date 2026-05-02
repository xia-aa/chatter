import type { Db } from '#/db.server';
import {
	friendRequestTable,
	friendTable,
} from '#/features/friend/friend.table';
import type { CreateFriend, SendFriendRequestIn } from './friend.schema';
export const _sendFriendRequest = (
	db: Db,
	authId: string,
	data: SendFriendRequestIn,
) =>
	db
		.insert(friendRequestTable)
		.values({
			emitter_id: authId, // 发送请求的用户
			receiver_id: data.receiver_id, // 接收请求的用户
			status: 'pending',
			message: data.message,
			nickname: data.nickname,
		})
		.onConflictDoUpdate({
			target: [friendRequestTable.emitter_id, friendRequestTable.receiver_id],
			set: {
				status: 'pending',
				message: data.message,
				nickname: data.nickname,
			},
		})
		.returning();

// 创建好友关系: 双向插入
export const _createFriend = async (
	db: Db,
	{ emitter_id, receiver_id, nickname }: CreateFriend,
) => {
	await db.insert(friendTable).values([
		{ userId: emitter_id, friendId: receiver_id, nickname },
		{ userId: receiver_id, friendId: emitter_id },
	]);
};

// export const nicknameSql = (t: typeof friend, authId: string) => sql<string | null>`
//     CASE
//       WHEN ${t.user1Id} = ${authId} THEN ${t.nicknameFromUser1}
//       ELSE ${t.nicknameFromUser2}
//     END
//   `
