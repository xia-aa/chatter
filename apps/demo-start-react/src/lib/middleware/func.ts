import { createMiddleware } from '@tanstack/react-start';
import { getSession } from '#/lib/auth.func.ts';
import { auth } from '#/lib/auth.ts';

export const authMiddle = createMiddleware({ type: 'function' }).server(
	async ({ next }) => {
		const session = await getSession();
		if (!session) {
			throw new Error(`Unauthorized`);
		}
		return next({
			context: { user: session.user },
		});
	},
);
