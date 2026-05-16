import { createMiddleware, createServerFn } from '@tanstack/solid-start';
import { getSession } from '#/lib/auth/auth.fn.ts';

export const authOrNoMiddle = createMiddleware({ type: 'function' }).server(
	async ({ next }) => {
		const session = await getSession();
		return next({
			context: { user: session?.user || null },
		});
	},
);
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

export const Fn = createServerFn({ method: 'POST' });
export const authFn = Fn.middleware([authMiddle]);
export const authOrNoFn = Fn.middleware([authOrNoMiddle]);

export const getFn = createServerFn({ method: 'GET' });
export const getAuthFn = getFn.middleware([authMiddle]);
export const getAuthOrNoFn = getFn.middleware([authOrNoMiddle]);
