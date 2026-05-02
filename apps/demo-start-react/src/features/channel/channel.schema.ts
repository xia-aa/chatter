import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { z } from 'zod';
import {
	channelTable,
	dmMemberTable,
	dmRoomTable,
} from '#/features/channel/channel.table';

// channel
export const selectChannelZ = createSelectSchema(channelTable);
export type SelectChannel = z.infer<typeof selectChannelZ>;
export const insertChannelZ = createInsertSchema(channelTable);
export type InsertChannel = z.infer<typeof insertChannelZ>;
export const updateChannelZ = createSelectSchema(channelTable);
export type UpdateChannel = z.infer<typeof updateChannelZ>;

// oRPC 输入验证
export const insertChannelIn = insertChannelZ.pick({
	mode: true,
	entity_type: true,
	entity_id: true,
	name: true,
	description: true,
	is_private: true,
	is_nsfw: true,
	rate_limit_per_user: true,
});
export type InsertChannelIn = z.input<typeof insertChannelIn>;

export const updateChannelIn = selectChannelZ.pick({
	id: true,
	name: true,
	description: true,
	sort: true,
});
export type UpdateChannelIn = z.input<typeof updateChannelIn>;

export const deleteChannelIn = selectChannelZ.pick({
	id: true,
});
export type DeleteChannelIn = z.input<typeof deleteChannelIn>;

// dmRoom
export const selectDmRoomZ = createSelectSchema(dmRoomTable);
export type SelectDmRoom = z.infer<typeof selectDmRoomZ>;
export const insertDmRoomZ = createInsertSchema(dmRoomTable);
export type InsertDmRoom = z.infer<typeof insertDmRoomZ>;

// oRPC 输入验证 — dmRoom
export const insertDmRoomIn = insertDmRoomZ.pick({
	type: true,
	name: true,
	icon: true,
});
export type InsertDmRoomIn = z.input<typeof insertDmRoomIn>;

export const updateDmRoomIn = selectDmRoomZ.pick({
	id: true,
	name: true,
	icon: true,
});
export type UpdateDmRoomIn = z.input<typeof updateDmRoomIn>;

export const deleteDmRoomIn = selectDmRoomZ.pick({
	id: true,
});
export type DeleteDmRoomIn = z.input<typeof deleteDmRoomIn>;

// dmMember
export const selectDmMemberZ = createSelectSchema(dmMemberTable);
export type SelectDmMember = z.infer<typeof selectDmMemberZ>;
export const insertDmMemberZ = createInsertSchema(dmMemberTable);
export type InsertDmMember = z.infer<typeof insertDmMemberZ>;

// oRPC 输入验证 — dmMember
export const insertDmMemberIn = insertDmMemberZ.pick({
	room_id: true,
	user_id: true,
	role: true,
	nickname: true,
});
export type InsertDmMemberIn = z.input<typeof insertDmMemberIn>;

export const updateDmMemberIn = selectDmMemberZ.pick({
	id: true,
	role: true,
	nickname: true,
});
export type UpdateDmMemberIn = z.input<typeof updateDmMemberIn>;

export const deleteDmMemberIn = selectDmMemberZ.pick({
	id: true,
});
export type DeleteDmMemberIn = z.input<typeof deleteDmMemberIn>;
