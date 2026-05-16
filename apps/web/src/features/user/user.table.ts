import { pgTimeId } from '@repo/shared/db/helpers';
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { userTable } from '#/lib/auth/auth.table.ts';

export const profileTable = pgTable('profile', {
	id: pgTimeId(),
	userId: text('user_id')
		.references(() => userTable.id, { onDelete: 'cascade' })
		.notNull()
		.unique(),
	summary: text('summary'),
	description: text('description'),
	birthday: timestamp('birthday'),
	personalizedRecommendation: boolean('personalized_recommendation').default(
		false,
	),
	color: text('color'),
	banner: text('banner'),
});
