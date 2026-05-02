import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { pgNanoid } from '#/db.helpers';
import { user } from '#/lib/auth/auth.table.ts';

export const profileTable = pgTable('profile', {
	id: pgNanoid(),
	userId: text('user_id')
		.references(() => user.id, { onDelete: 'cascade' })
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
