import { createMiddleware } from '@tanstack/react-start';
import { auth } from '#/lib/auth.ts';

export const reqAuthMiddle = createMiddleware().server(
	async ({ request, next }) => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session) {
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
