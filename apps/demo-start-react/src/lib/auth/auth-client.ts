import { passkeyClient } from '@better-auth/passkey/client';
import {
	adminClient,
	anonymousClient,
	customSessionClient,
	emailOTPClient,
	phoneNumberClient,
	twoFactorClient,
	usernameClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import type { auth } from '#/lib/auth';
export const authClient = createAuthClient({
	// baseURL: env.VITE_APP_URL,
	fetchOptions: {
		onError: async (context) => {
			const { response } = context;
			if (response.status === 429) {
				const retryAfter = response.headers.get('X-Retry-After');
				console.log(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
				// context.response = new Response(
				//   JSON.stringify({
				//     message: `请求过于频繁, 请 ${retryAfter} 秒后重试`,
				//   }),
				//   { status: 429 },
				// );
			}
		},
	},
	plugins: [
		twoFactorClient(),
		anonymousClient(),
		usernameClient(),
		phoneNumberClient(),
		emailOTPClient(),
		adminClient(),
		// organizationClient(),
		passkeyClient(),
		customSessionClient<typeof auth>(),
	],
});
