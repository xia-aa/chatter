import {
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from 'drizzle-orm/pg-core';
import { nanoidWithTimestamps } from '#/db.helpers';
import { friendStatuses } from '#/features/friend/friend.const';
import { user } from '#/lib/auth/auth.table.ts';

export const friendRequestTable = pgTable(
	'friend_request',
	{
		...nanoidWithTimestamps,
		emitter_id: text('emitter_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		receiver_id: text('receiver_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		status: text({ enum: friendStatuses }).default('pending').notNull(),
		accepted_at: timestamp('accepted_at', { mode: 'string' }),
		message: text('message'),
		nickname: text('nickname'), // emitter 为 receiver 提前起的昵称, 后续需要复制到 friend 表
		tags: text('tags').array(), // emitter 为 receiver 选择的tags, 后续需要 插入 link 表
	},
	(t) => [uniqueIndex('emitter_receiver_idx').on(t.emitter_id, t.receiver_id)],
);
// 采用 双向插入 比 智能查询 的 查询性能高, 且 理解起来更简单
export const friendTable = pgTable(
	'friend',
	{
		...nanoidWithTimestamps,
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		friendId: text('friend_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		nickname: text('nickname'), // user 为 friend 起的昵称
	},
	(table) => [
		// uniqueIndex("friend_unique_user1_user2_idx").using(
		//   "btree",
		//   table.user1Id.asc().nullsLast().op("text_ops"),
		//   table.user2Id.asc().nullsLast().op("text_ops"),
		// ),
		uniqueIndex().on(table.userId, table.friendId),
	],
);

// 用户的好友 tag
export const friendTagTable = pgTable(
	'friend_tag',
	{
		...nanoidWithTimestamps,
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }), // 自己
		name: text('name').notNull(),
		order: integer('order').default(0).notNull(), // 排序值：越小越前（用户可改）
		// 可选：加描述或图标
		// description: text("description"),
	},
	(t) => [
		uniqueIndex('friend_tag_unique_name_idx').on(t.userId, t.name), // 用户内组名唯一
		index('friend_tag_user_order_idx').on(t.userId, t.order), // 加速排序查询
	],
);

// 简化桥接：好友到 tag 的关联（多对多）
export const friendToTag = pgTable(
	'friend_to_tag',
	{
		friendId: text('friend_id')
			.notNull()
			.references(() => friendTable.id, { onDelete: 'cascade' }),
		friendTagId: text('friend_tag_id')
			.notNull()
			.references(() => friendTagTable.id, { onDelete: 'cascade' }),
	},
	(t) => [
		uniqueIndex('friend_to_tag_unique_idx').on(t.friendId, t.friendTagId), // 防止重复关联
		index('friend_to_tag_friend_idx').on(t.friendId), // 加速删除/查询
	],
);
