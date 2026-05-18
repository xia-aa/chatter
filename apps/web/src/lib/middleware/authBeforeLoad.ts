import { redirect } from '@tanstack/solid-router';
import type { AuthUser } from '#/lib/auth/config.ts';

export const authBeforeLoad = async (
	user: AuthUser | null,
	callbackURL: string = '/',
) => {
	if (!user) {
		console.log('No session, redirecting to login');
		throw redirect({
			to: '/auth',
			search: { callbackURL },
		});
	}
	return { user };
};
export const adminBeforeLoad = async (
	user: AuthUser | null,
	callbackURL: string = '/',
) => {
	if (user?.role !== 'admin') {
		console.log('No session, redirecting to login');
		throw redirect({
			to: '/auth',
			search: { callbackURL },
		});
	}
	return { user };
};
