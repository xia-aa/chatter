import { clientEnv } from '@repo/shared/env/env._client';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins/admin';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import * as schema from '#/db/schema.ts';
import { db } from '#/db/server.ts';
export const auth = betterAuth({
	baseURL: clientEnv.VITE_APP_URL,
	advanced: {
		cookiePrefix: 'chatter',
	},
	session: {
		expiresIn: 60 * 60 * 24 * 30, // 30 days
		updateAge: 60 * 60 * 24 * 2, // 1 day (every 2 day the session expiration is updated)
		// https://www.better-auth.com/docs/concepts/session-management#cookie-cache
		// 使用 类似 jwt 的机制将 session 缓存到 cookie 中, 避免一次请求多次查询数据库(可以用react.cache 进行缓存, 但对于非 jsx 渲染的 部分 不适用, 例如 ws 接口)
		cookieCache: {
			enabled: true,
			maxAge: 15 * 60, // Cache duration in seconds (15 minutes)
			strategy: 'jwt', // can be "compact" or "jwt" or "jwe"
			// refreshCache: true, // Enable stateless refresh
			// refreshCache: {
			//   updateAge: 60, // Refresh when 60 seconds remain before expiry
			// },
		},
	},
	account: {
		storeStateStrategy: 'cookie',
		storeAccountCookie: true, // Store account data after OAuth flow in a cookie (useful for database-less flows)
	},
	database: drizzleAdapter(db, {
		provider: 'pg', // or "mysql", "sqlite"
		schema: schema,
	}),

	emailAndPassword: {
		enabled: true,
	},
	plugins: [tanstackStartCookies(), admin()],
});
export type AuthUser = typeof auth.$Infer.Session.user & { username: string };
export type AuthSession = {
	user: AuthUser;
	session: typeof auth.$Infer.Session.session;
	// token: typeof auth.$Infer.Session.token;
};
