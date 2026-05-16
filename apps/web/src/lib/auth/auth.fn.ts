import { createServerFn } from '@tanstack/solid-start';
import { getRequestHeaders } from '@tanstack/solid-start/server';
import { type AuthSession, auth } from '#/lib/auth/config.ts';

export const getSession = createServerFn({ method: 'GET' }).handler(
	async () => {
		const headers = getRequestHeaders();
		const session = await auth.api.getSession({ headers });
		return session as AuthSession | null;
	},
);
