import { boolean, json, jsonb, pgTable, text } from 'drizzle-orm/pg-core';
import { nanoidWithTimestamps } from '#/db.helpers.ts';
import { user } from '#/lib/auth/auth.table.ts';

export const todo = pgTable('todo', {
	...nanoidWithTimestamps,
	title: text(),
	content: jsonb().$type<any>(),
	completed: boolean().default(false).notNull(),
	user_id: text(`user_id`)
		.notNull()
		.references(() => user.id, { onDelete: `cascade` }),
});
