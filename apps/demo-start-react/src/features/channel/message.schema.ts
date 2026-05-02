import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { nanoid } from 'nanoid';
import type { z } from 'zod';
import {
	messageAttachmentsZ,
	messageMentionsZ,
	messageReactionsZ,
} from '#/features/channel/channel.const.ts';
import { messageTable } from './channel.table';

export const selectMessageZ = createSelectSchema(messageTable, {
	id: (s) => s.default(() => nanoid()),
	channel_id: (s) => s.nullish(),
	room_id: (s) => s.nullish(),
	created_at: (s) => s.default(() => new Date()),
	updated_at: (s) => s.default(() => new Date()),
	is_edited: (s) => s.default(false),
	is_deleted: (s) => s.default(false),
	is_pinned: (s) => s.default(false),
	content_category: (s) => s.default('text'),
	attachments: messageAttachmentsZ,
	mentions: messageMentionsZ,
	reactions: messageReactionsZ,
});
export type SelectMessage = z.infer<typeof selectMessageZ>;

// 插入 — 基于 createInsertSchema（id 等自动生成字段为可选）
export const insertMessageZ = createInsertSchema(messageTable, {
	attachments: messageAttachmentsZ,
	mentions: messageMentionsZ,
	reactions: messageReactionsZ,
});

export const sendMessageIn = insertMessageZ.pick({
	channel_id: true,
	room_id: true,
	content: true,
	content_category: true,
	reply_to_id: true,
	attachments: true,
	mentions: true,
	reactions: true,
});
export type SendMessageIn = z.input<typeof sendMessageIn>;

// 更新/删除 — 基于 createSelectSchema（id 为必填）
export const updateMessageIn = selectMessageZ.pick({
	id: true,
	content: true,
});
export type UpdateMessageIn = z.input<typeof updateMessageIn>;

export const deleteMessageIn = selectMessageZ.pick({
	id: true,
});
export type DeleteMessageIn = z.input<typeof deleteMessageIn>;
