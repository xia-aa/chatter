import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { nanoid } from 'nanoid';
import type z from 'zod';
import {
	friendRequestTable,
	friendTable,
	friendTagTable,
} from '#/features/friend/friend.table';

// export const friendItemZ = friendSelectZ
//   .omit({ created_at: true, updated_at: true, status: true, reason: true })
//   .extend({
//     user1: userItemZ.nullable(),
//     user2: userItemZ.nullable(),
//   });
// export type FriendItem = z.infer<typeof friendItemZ>;

export const selectFriendZ = createSelectSchema(friendTable, {
	id: (s) => s.default(() => nanoid()),
	created_at: (s) => s.default(() => new Date()),
	updated_at: (s) => s.default(() => new Date()),
	nickname: (s) => s.optional(),
});
export type SelectFriend = z.infer<typeof selectFriendZ>;
export const selectFriendRequestZ = createSelectSchema(friendRequestTable, {
	id: (s) => s.default(() => nanoid()),
	created_at: (s) => s.default(() => new Date()),
	updated_at: (s) => s.default(() => new Date()),
	accepted_at: (s) => s.nullable().default(null),
	message: (s) => s.nullable().default(null),
	nickname: (s) => s.optional(),
	tags: (s) => s.optional(),
});
export type SelectFriendRequest = z.infer<typeof selectFriendRequestZ>;

export const selectFriendTagZ = createSelectSchema(friendTagTable, {
	id: (s) => s.default(() => nanoid()),
	created_at: (s) => s.default(() => new Date()),
	updated_at: (s) => s.default(() => new Date()),
	order: (s) => s.default(0),
});
export type SelectFriendTag = z.input<typeof selectFriendTagZ>;

const createFriendZ = createSelectSchema(friendRequestTable).pick({
	emitter_id: true,
	receiver_id: true,
	nickname: true,
	tags: true,
});
export type CreateFriend = z.infer<typeof createFriendZ>;

const friendRequestInsertZ = createInsertSchema(friendRequestTable);

export const sendFriendRequestZ = friendRequestInsertZ.pick({
	emitter_id: true,
	receiver_id: true,
	message: true,
	nickname: true,
	tags: true,
});
export type SendFriendRequest = z.infer<typeof sendFriendRequestZ>;

export const sendFriendRequestIn = sendFriendRequestZ.omit({
	emitter_id: true,
});
export type SendFriendRequestIn = z.input<typeof sendFriendRequestIn>;

export const acceptFriendRequestZ = selectFriendRequestZ.pick({
	id: true,
	receiver_id: true,
});
export type AcceptFriendRequest = z.infer<typeof acceptFriendRequestZ>;

export const acceptFriendRequestIn = acceptFriendRequestZ.omit({
	receiver_id: true,
});

export const rejectFriendRequestZ = selectFriendRequestZ.pick({
	id: true,
	receiver_id: true,
});
export type RejectFriendRequest = z.infer<typeof rejectFriendRequestZ>;
