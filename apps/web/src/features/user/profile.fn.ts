import { toDrizzle } from 'agnostic-query/drizzle/pg';
import { createQuerySchema } from 'agnostic-query/zod';
import { z } from 'zod';
import { db } from '#/db/server.ts';
import { profileTable } from '#/features/user/user.table.ts';
import { getAuthOrNoFn } from '#/lib/middleware/func.ts';

type Profile = typeof profileTable.$inferSelect;

export const selectProfile = getAuthOrNoFn
	.inputValidator(createQuerySchema<Profile>())
	.handler(async ({ data }) => {
		return await toDrizzle(db, profileTable, data);
	});
