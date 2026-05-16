import { timeId } from '@repo/shared/db/timeId.ts';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import {
	channelTable,
	dmMemberTable,
	dmRoomTable,
} from '#/features/channel/channel.table';

// channel
export const channelSchema = createSelectSchema(channelTable, {
	id: (s) => s.default(timeId()),
	created_at: (s) => s.default(new Date()),
	updated_at: (s) => s.default(new Date()),
	mode: (s) => s.default('chat'),
	entity_type: (s) => s.default('community'),
	name: (s) => s.nullish(),
	description: (s) => s.nullish(),
	sort: (s) => s.default(0),
	is_private: (s) => s.default(false),
	permission_overwrites: (s) => s.default([]),
	is_nsfw: (s) => s.default(false),
	rate_limit_per_user: (s) => s.default(0),
});
export type SelectChannel = z.infer<typeof channelSchema>;
export const _insertChannelSchema = createInsertSchema(channelTable);

export const listChannelIn = channelSchema.pick({
	entity_type: true,
	entity_id: true,
});
export type ListChannelIn = z.output<typeof listChannelIn>;

export const insertChannelSchema = _insertChannelSchema.pick({
	mode: true,
	entity_type: true,
	entity_id: true,
	name: true,
	description: true,
	is_private: true,
	is_nsfw: true,
	rate_limit_per_user: true,
});

export const updateChannelSchema = channelSchema.pick({
	id: true,
	name: true,
	description: true,
	sort: true,
});
export type UpdateChannelIn = z.output<typeof updateChannelSchema>;

export const deleteChannelSchema = z.object({
	id: z.string(),
});

// dmRoom
export const dmRoomSchema = createSelectSchema(dmRoomTable, {
	id: (s) => s.default(timeId),
	created_at: (s) => s.default(new Date()),
	updated_at: (s) => s.default(new Date()),
	type: (s) => s.default('single'),
	name: (s) => s.nullish(),
	icon: (s) => s.nullish(),
});
export type SelectDmRoom = z.infer<typeof dmRoomSchema>;
export const insertDmRoomZ = createInsertSchema(dmRoomTable);
export type InsertDmRoom = z.infer<typeof insertDmRoomZ>;

// oRPC 输入验证 — dmRoom
export const insertDmRoomSchema = insertDmRoomZ.pick({
	type: true,
	name: true,
	icon: true,
});
export type InsertDmRoomIn = z.output<typeof insertDmRoomSchema>;

export const updateDmRoomSchema = dmRoomSchema.pick({
	id: true,
	name: true,
	icon: true,
});
export type UpdateDmRoomIn = z.input<typeof updateDmRoomSchema>;

export const deleteDmRoomSchema = dmRoomSchema.pick({
	id: true,
});
export type DeleteDmRoomIn = z.input<typeof deleteDmRoomSchema>;

// dmMember
export const dmMemberSchema = createSelectSchema(dmMemberTable, {
	id: (s) => s.default(timeId),
	created_at: (s) => s.default(new Date()),
	updated_at: (s) => s.default(new Date()),
	role: (s) => s.default('member'),
	nickname: (s) => s.nullish(),
});
export type SelectDmMember = z.infer<typeof dmMemberSchema>;
export const insertDmMemberZ = createInsertSchema(dmMemberTable);
export type InsertDmMember = z.infer<typeof insertDmMemberZ>;

// oRPC 输入验证 — dmMember
export const insertDmMemberSchema = insertDmMemberZ.pick({
	room_id: true,
	user_id: true,
	role: true,
	nickname: true,
});
export type InsertDmMemberIn = z.input<typeof insertDmMemberSchema>;

export const updateDmMemberSchema = dmMemberSchema.pick({
	id: true,
	role: true,
	nickname: true,
});
export type UpdateDmMemberIn = z.input<typeof updateDmMemberSchema>;

export const deleteDmMemberSchema = dmMemberSchema.pick({
	id: true,
});
export type DeleteDmMemberIn = z.input<typeof deleteDmMemberSchema>;
