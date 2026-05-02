import { and, desc, ilike, lt, ne, or } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '#/db.server';
import { user } from '#/lib/auth/auth.table.ts';
import { authOrNotFn, getFn } from '#/orpc.base';

const searchUserZ = z.object({
	q: z.string().min(1),
	cursor: z.string().optional(),
	limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const searchUser = authOrNotFn
	.input(searchUserZ)
	.handler(async ({ input, context }) => {
		const filters = [
			or(
				ilike(user.username, `%${input.q}%`),
				ilike(user.displayUsername, `%${input.q}%`),
			),
		];

		if (input.cursor) {
			filters.push(lt(user.createdAt, new Date(input.cursor)));
		}

		if (context.user) {
			filters.push(ne(user.id, context.user.id));
		}

		const users = await db
			.select({
				id: user.id,
				name: user.name,
				username: user.username,
				displayUsername: user.displayUsername,
				image: user.image,
				createdAt: user.createdAt,
			})
			.from(user)
			.where(and(...filters))
			.orderBy(desc(user.createdAt))
			.limit(input.limit + 1);

		const hasMore = users.length > input.limit;
		const items = hasMore ? users.slice(0, -1) : users;
		const nextCursor = hasMore ? items[items.length - 1]?.createdAt : undefined;

		return {
			items,
			nextCursor: nextCursor ? String(nextCursor) : undefined,
		};
	});

export const userApi = {
	search: searchUser,
	select: getFn.handler(() => db.select().from(user)),
};
