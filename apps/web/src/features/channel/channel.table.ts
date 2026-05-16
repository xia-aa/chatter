import { timeIdWithTimestamps } from '@repo/shared/db/helpers';
import {
	type AnyPgColumn,
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from 'drizzle-orm/pg-core';
import {
	channelModes,
	channelOwnerTypes,
	dmRoomTypes,
	type MessageAttachments,
	type MessageMentions,
	type MessageReactions,
	messageContextTypes,
	type PermissionOverwrite,
} from '#/features/channel/channel.const';
import { userTable } from '#/lib/auth/auth.table.ts';

// 频道表 - 社区/项目/团队的频道
export const channelTable = pgTable(
	'channel',
	{
		...timeIdWithTimestamps,
		mode: text({ enum: channelModes }).default('chat').notNull(),
		// 实体类型：频道属于哪种实体（community, project, team, user）
		entity_type: text({ enum: channelOwnerTypes })
			.notNull()
			.default('community'),
		// 实体 ID：指向所属实体的 id
		entity_id: text().notNull(),

		name: text(),
		description: text(),
		sort: integer().default(0).notNull(),

		// 是否私有频道 - 私有频道需要成员权限才能访问
		is_private: boolean().default(false).notNull(),
		// 权限覆盖规则 - 针对角色或用户的自定义权限设置，支持细粒度访问控制
		permission_overwrites: jsonb()
			.$type<PermissionOverwrite[]>()
			.default([])
			.notNull(),

		// 是否为成人内容频道 - 前端可据此显示年龄限制提示
		is_nsfw: boolean().default(false).notNull(),
		// 用户发言频率限制（秒）- 防止刷屏，0 表示无限制
		rate_limit_per_user: integer().default(0).notNull(),
	},
	(table) => [
		index('channel_entity_idx').on(table.entity_type, table.entity_id),
		index('channel_sort_idx').on(table.entity_id, table.sort),
	],
);

// 私聊\私人群聊会话表
export const dmRoomTable = pgTable(
	'dm_room',
	{
		...timeIdWithTimestamps,
		type: text('type', { enum: dmRoomTypes }).default('single').notNull(),
		name: varchar({ length: 100 }), // 群名，single 无需填写
		// 群头像，single 无需
		icon: text(),
	},
	(table) => [index('dm_room_type_idx').on(table.type)],
);

// 私聊成员表
export const dmMemberTable = pgTable(
	'dm_member',
	{
		...timeIdWithTimestamps,
		room_id: text('room_id')
			.notNull()
			.references(() => dmRoomTable.id, { onDelete: 'cascade' }),
		user_id: text('user_id')
			.notNull()
			.references(() => userTable.id, { onDelete: 'cascade' }),
		// 群聊中的角色，single 无需
		role: varchar('role', { length: 20 }).default('member'), // 'owner' | 'admin' | 'member'
		nickname: varchar('nickname', { length: 100 }), // 群聊中的昵称
	},
	(t) => [
		uniqueIndex('dm_member_unique_idx').on(t.room_id, t.user_id),
		index('dm_member_user_idx').on(t.user_id),
	],
);

// 消息表 - 统一频道消息和私聊消息
export const messageTable = pgTable(
	'message',
	{
		...timeIdWithTimestamps,
		// 频道消息
		channel_id: text().references(() => channelTable.id, {
			onDelete: 'cascade',
		}),
		// 私聊消息
		room_id: text().references(() => dmRoomTable.id, {
			onDelete: 'cascade',
		}),
		user_id: text().references(() => userTable.id, {
			onDelete: 'set null',
		}),
		// 发送者冗余信息（用于快速显示，用户改名后可能不一致）
		sender_name: text('sender_name'),
		sender_avatar: text('sender_avatar'),
		content: text(),
		content_category: text().default('text').notNull(),
		reply_to_id: text().references((): AnyPgColumn => messageTable.id), // 自引用
		is_edited: boolean('is_edited').default(false).notNull(),
		is_deleted: boolean('is_deleted').default(false).notNull(),
		is_pinned: boolean('is_pinned').default(false).notNull(),
		attachments: jsonb().$type<MessageAttachments>().default([]).notNull(),
		mentions: jsonb().$type<MessageMentions>().default({}).notNull(),
		reactions: jsonb().$type<MessageReactions>().default([]).notNull(),
	},
	(table) => [
		index('message_channel_idx').on(table.channel_id),
		index('message_room_idx').on(table.room_id),
		index('message_user_idx').on(table.user_id),
		index('message_created_at_idx').on(table.created_at),
	],
);

// 阅读状态
export const readStateTable = pgTable(
	'read_state',
	{
		user_id: text()
			.notNull()
			.references(() => userTable.id, { onDelete: 'cascade' }),
		target_type: text({ enum: messageContextTypes }).notNull(),
		target_id: text().notNull(), // 指向 channel.id 或 dm_room.id
		last_read_message_id: text()
			.notNull()
			.references(() => messageTable.id, { onDelete: 'cascade' }),
		last_read_at: timestamp()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(t) => [
		primaryKey({ columns: [t.user_id, t.target_type, t.target_id] }),
		index('read_state_user_idx').on(t.user_id),
		index('read_state_target_idx').on(t.target_type, t.target_id),
	],
);
