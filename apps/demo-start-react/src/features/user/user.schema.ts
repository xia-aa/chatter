import { profileTable } from '#/features/user/user.table';
import { user } from '#/lib/auth/auth.table.ts';
export const selectUserZ = createSelectSchema(user);
export type SelectUser = z.infer<typeof selectUserZ>;
export const userInsertZ = createInsertSchema(user);
export type UserInsert = typeof user.$inferInsert;
export const _userUpdateZ = createUpdateSchema(user);

export type _UserUpdate = z.infer<typeof _userUpdateZ>;

import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from 'drizzle-zod';
import { z } from 'zod';

export const userRes = selectUserZ.extend({
	created_at: z.string().or(z.date()),
	updated_at: z.string().or(z.date()),
	banExpires: z.string().or(z.date()).nullable(),
});

export type UserRes = z.infer<typeof userRes>;

export const userItemFields = {
	id: true,
	name: true,
	username: true,
	displayUsername: true,
	email: true,
	image: true,
} as const;
export const userItemZ = selectUserZ.pick(userItemFields);
export type UserItem = z.infer<typeof userItemZ>;

const _profileUpdateZ = createUpdateSchema(profileTable);
export const userUpdateZ = _userUpdateZ.extend(_profileUpdateZ.shape).pick({
	name: true,
	// email: true,
	image: true,
	username: true,
	displayUsername: true,
	// phoneNumber: true,
	summary: true,
	color: true,
	banner: true,
	description: true,
	personalizedRecommendation: true,
});
export type UserUpdate = z.infer<typeof userUpdateZ>;

export type UserOrTeamType = 'user' | 'team';

export interface AllData {
	follows: string[]; //
	projects: string[]; //
	user: UserRes;
	// notifs: []; //
	// notifs_deliveries: [] // recipients
}
