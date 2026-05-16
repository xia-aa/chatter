import { createMiddleware } from '@tanstack/react-start';
import { auth } from '#/lib/auth/config.ts';

export const reqAuthOrNoMiddle = createMiddleware().server(
	async ({ next, request }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		return next({
			context: { user: session?.user || null },
		});
	},
);
export const reqAuthMiddle = createMiddleware().server(
	async ({ request, next }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session) {
			console.log('reqAuthMiddle.Unauthorized');
			return new Response(JSON.stringify({ error: `Unauthorized` }), {
				status: 401,
				headers: { 'content-type': `application/json` },
			});
		}
		return next({
			context: { user: session.user },
		});
	},
);
