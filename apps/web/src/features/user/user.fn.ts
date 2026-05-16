import { and, desc, eq, ilike, lt, ne, or, sql } from 'drizzle-orm';
import z from 'zod';
import { db } from '#/db/server.ts';
import { editUserSchema } from '#/features/user/user.schema';
import { profileTable } from '#/features/user/user.table';
import { userTable } from '#/lib/auth/auth.table.ts';
import {
	authFn,
	getAuthFn,
	getAuthOrNoFn,
	getFn,
} from '#/lib/middleware/func.ts';

export const selectUser = getFn.handler(() => db.select().from(userTable));

export const editUser = authFn
	.inputValidator(editUserSchema)
	.handler(
		async ({
			data: { username, displayUsername, name, image, ...data },
			context,
		}) => {
			return await db.transaction(async (tx) => {
				await tx
					.update(userTable)
					.set({
						username: username,
						displayUsername: displayUsername,
						name: name || displayUsername || undefined,
						image: image,
					})
					.where(eq(userTable.id, context.user.id));
				if (!Object.values(data).some((v) => v !== undefined)) return true;
				await tx
					.insert(profileTable)
					.values({
						userId: context.user.id,
						...data,
					})
					.onConflictDoUpdate({
						target: profileTable.userId,
						set: data,
					});
				return true;
			});
		},
	);

const searchUserSchema = z.object({
	q: z.string().min(1),
	cursor: z.string().optional(),
	limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});
// 保留实现 为 未来提供参考
const searchUser = getAuthOrNoFn
	.inputValidator(searchUserSchema)
	.handler(async ({ data, context }) => {
		const filters = [
			or(
				ilike(userTable.username, `%${data.q}%`),
				ilike(userTable.displayUsername, `%${data.q}%`),
			),
		];

		if (data.cursor) {
			filters.push(lt(userTable.createdAt, new Date(data.cursor)));
		}

		if (context.user) {
			filters.push(ne(userTable.id, context.user.id));
		}

		const users = await db
			.select({
				id: userTable.id,
				name: userTable.name,
				username: userTable.username,
				displayUsername: userTable.displayUsername,
				image: userTable.image,
				createdAt: userTable.createdAt,
			})
			.from(userTable)
			.where(and(...filters))
			.orderBy(desc(userTable.createdAt))
			.limit(data.limit + 1);

		const hasMore = users.length > data.limit;
		const items = hasMore ? users.slice(0, -1) : users;
		const nextCursor = hasMore ? items[items.length - 1]?.createdAt : undefined;

		return {
			items,
			nextCursor: nextCursor ? String(nextCursor) : undefined,
		};
	});
