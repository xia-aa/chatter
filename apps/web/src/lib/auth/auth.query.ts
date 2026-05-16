import { environmentManager, queryOptions } from '@tanstack/solid-query';
import { getSession } from '#/lib/auth/auth.fn.ts';
import { authClient } from '#/lib/auth/auth-client.ts';
import type { AuthSession } from '#/lib/auth/config.ts';

export const sessionQuery = queryOptions({
	queryKey: ['session'],
	queryFn: async () => {
		if (environmentManager.isServer()) {
			console.log('getSession:onServer');
			// const res = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/auth/get-session`)
			// const data = await res.json()
			// return data as AuthSession
			return await getSession();
		}
		console.log('getSession:onClient');
		const { data, error } = await authClient.getSession();
		if (error) {
			throw error;
		}
		return data as AuthSession | null;
	},
	staleTime: 5 * 60 * 1000, // 5 分钟，短 token 15 分钟，所以 5 分钟刷新一次比较安全 default: 0
	gcTime: 10 * 60 * 1000, // 10 分钟缓存, default: 5 minutes
	// retry: false,  // 认证失败不重试（避免无限循环） default: 3
	// refetchOnWindowFocus: true, // 窗口焦点时刷新（用户回来可能 token 过期） default: true
	// refetchOnMount: true, default: true
});
