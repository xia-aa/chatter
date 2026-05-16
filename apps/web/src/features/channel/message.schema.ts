import { timeId } from '@repo/shared/db/timeId';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import {
	messageAttachmentsZ,
	messageMentionsZ,
	messageReactionsZ,
} from '#/features/channel/channel.const.ts';
import { messageTable } from './channel.table';

export const messageSchema = createSelectSchema(messageTable, {
	id: (s) => s.default(timeId()),
	channel_id: (s) => s.nullish(),
	room_id: (s) => s.nullish(),
	content: (s) => s.nullish(),
	user_id: (s) => s.nullish(),
	reply_to_id: (s) => s.nullish(),
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
export type SelectMessage = z.infer<typeof messageSchema>;

// 插入 — 基于 createInsertSchema（id 等自动生成字段为可选）
const insertMessageZ = createInsertSchema(messageTable, {
	content: z.any().nullish(),
	attachments: messageAttachmentsZ,
	mentions: messageMentionsZ,
	reactions: messageReactionsZ,
});

export const sendMessageSchema = messageSchema
	.pick({
		id: true,
		channel_id: true,
		room_id: true,
		content: true,
		content_category: true,
		reply_to_id: true,
		attachments: true,
		mentions: true,
		reactions: true,
	})
	.refine(
		(data) => {
			const hasContent = data.content !== '';
			const hasAttachments =
				Array.isArray(data.attachments) && data.attachments.length > 0;
			return hasContent || hasAttachments;
		},
		{
			message: '消息内容和附件不能同时为空',
		},
	);
export type SendMessageIn = z.input<typeof sendMessageSchema>;

// 更新/删除 — 基于 createSelectSchema（id 为必填）
export const updateMessageSchema = messageSchema.pick({
	id: true,
	content: true,
});
export type UpdateMessageIn = z.input<typeof updateMessageSchema>;

export const deleteMessageSchema = messageSchema.pick({
	id: true,
});
export type DeleteMessageIn = z.input<typeof deleteMessageSchema>;
