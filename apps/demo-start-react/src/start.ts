// src/start.ts
import { createMiddleware, createStart } from '@tanstack/react-start';

const debugMiddleware = createMiddleware().server(async ({ request, next }) => {
	const startTime = Date.now();
	const timestamp = new Date().toISOString();

	console.log(`[${timestamp}] ${request.method} ${request.url} - Starting`);
	try {
		const result = await next();
		const duration = Date.now() - startTime;

		console.log(
			`[${timestamp}] ${request.method} ${request.url} - ${result.response.status} (${duration}ms)`,
		);
		if (process.env.NODE_ENV === 'development') {
			result.response.headers.set(
				'X-Debug-Timestamp',
				new Date().toISOString(),
			);
			result.response.headers.set('X-Debug-Node-Version', process.version);
			result.response.headers.set(
				'X-Debug-Uptime',
				process.uptime().toString(),
			);
		}

		return result;
	} catch (error) {
		const duration = Date.now() - startTime;
		console.error(
			`[${timestamp}] ${request.method} ${request.url} - Error (${duration}ms):`,
			error,
		);
		throw error;
	}
});
// 全局中间件
export const startInstance = createStart(() => {
	return {
		// requestMiddleware: [debugMiddleware],
		defaultSsr: 'data-only',
	};
});
