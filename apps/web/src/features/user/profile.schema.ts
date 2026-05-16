import { timeId } from '@repo/shared/db/timeId.js';
import { profileTable } from '#/features/user/user.table';
import { userTable } from '#/lib/auth/auth.table.ts';
export const userSelectZ = createSelectSchema(userTable);
export type UserSelect = typeof userTable.$inferSelect;
export const userInsertZ = createInsertSchema(userTable);
export type UserInsert = typeof userTable.$inferInsert;
export const _userUpdateZ = createUpdateSchema(userTable);

export type _UserUpdate = z.infer<typeof _userUpdateZ>;

import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from 'drizzle-zod';
import type { z } from 'zod';

export const profileSchema = createSelectSchema(profileTable, {
	id: (s) => s.default(timeId()),
	birthday: (s) => s.nullish(),
	summary: (s) => s.nullish(),
	description: (s) => s.nullish(),
	personalizedRecommendation: (s) => s.default(false),
	color: (s) => s.nullish(),
	banner: (s) => s.nullish(),
});
export type SelectProfile = z.infer<typeof profileSchema>;
