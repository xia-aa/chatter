import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { type Db, db } from '#/db.server.ts';
import { friendTagTable } from '#/features/friend/friend.table.ts';
import { authFn, getAuthFn } from '#/orpc.base.ts';

export async function __createTag(userId: string, name: string, db: Db) {
	const [newTag] = await db
		.insert(friendTagTable)
		.values({
			userId,
			name,
		})
		.returning();
	return newTag;
}
export const friendTag = {
	/** 列出 用户有哪些 好友 标签 */
	select: getAuthFn.handler(({ context, errors }) => {
		return db
			.select()
			.from(friendTagTable)
			.where(eq(friendTagTable.userId, context.user.id));
	}),
	insert: authFn
		.input(z.object({ name: z.string().min(1) }))
		.handler(async ({ input, context, errors }) => {
			return await __createTag(context.user.id, input.name, db);
		}),
};
