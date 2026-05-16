import { createUpdateSchema } from 'drizzle-zod';
import { profileTable } from '#/features/user/user.table.ts';
import { userTable } from '#/lib/auth/auth.table.ts';

export const userItemFields = {
	id: true,
	name: true,
	username: true,
	displayUsername: true,
	email: true,
	image: true,
} as const;
export const editUserSchema = createUpdateSchema(userTable)
	.extend(createUpdateSchema(profileTable).shape)
	.pick({
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
