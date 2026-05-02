import { db } from '#/db.server.ts';
import { profileTable } from '#/features/user/user.table.ts';
import { getFn } from '#/orpc.base.ts';

export const profile = {
	select: getFn.handler(() => db.select().from(profileTable)),
};
