import { z } from 'zod';
import { fileShowZ } from '#/lib/upload/upload.const';

export const channelModes = [
	'chat',
	'discussion', // 讨论,评论,社区
	'readme', //  自述文件, 自我介绍
	'forum', // 论坛
	'welcome', // 欢迎
	'announcement', // 公告
	'guide', // 指南: 可以是其他人提供的攻略
	'release', // 发布会, 发布版本,用户侧
] as const;
export type ChannelMode = (typeof channelModes)[number];

export const channelOwnerTypes = [
	'community',
	'project',
	'team',
	'user',
] as const;
export type ChannelOwnerType = (typeof channelOwnerTypes)[number];

export const messageMentionsZ = z
	.object({
		users: z.array(z.string()).optional(),
		roles: z.array(z.string()).optional(),
		channels: z.array(z.string()).optional(),
		everyone: z.boolean().optional(),
	})
	.default({});
export type MessageMentions = z.output<typeof messageMentionsZ>;

export const messageReactionsZ = z
	.object({
		emoji: z.string(),
		count: z.number(),
		users: z.array(z.string()),
	})
	.array()
	.default([]);
export type MessageReactions = z.output<typeof messageReactionsZ>;

export const messageAttachmentsZ = z.array(fileShowZ).default([]);

export type MessageAttachments = z.output<typeof messageAttachmentsZ>;

export type PermissionOverwrite = {
	id: string; // 角色ID或用户ID
	type: 'role' | 'member';
	allow: string[]; // 允许的权限
	deny: string[]; // 拒绝的权限
};

export const dmRoomTypes = ['single', 'group'] as const;

export const messageContextTypes = ['channel', 'dm_room'] as const;
