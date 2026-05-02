import { ORPCError, onError, os } from '@orpc/server';
import type {
	RequestHeadersPluginContext,
	ResponseHeadersPluginContext,
} from '@orpc/server/plugins';
import z from 'zod';
import { getSession } from '#/lib/auth.func';

interface ORPCContext
	extends RequestHeadersPluginContext,
		ResponseHeadersPluginContext {}

export const base = os.$context<ORPCContext>().errors({
	// 400: Input/schema validation failed, malformed request, invalid params.
	// Usage: throw errors.BAD_REQUEST({ message: 'Invalid payload' })
	BAD_REQUEST: {},
	// 404: Resource does not exist.
	// Usage: throw errors.NOT_FOUND({ message: 'Todo not found' })
	NOT_FOUND: {},
	// 401: No valid session/token.
	// Usage: throw errors.UNAUTHORIZED({ message: 'Login required' })
	UNAUTHORIZED: {},
	// 409: State conflict, duplicate key, optimistic concurrency conflict.
	// Usage: throw errors.CONFLICT({ message: 'Todo already exists' })
	CONFLICT: {},
	// 403: Authenticated but not allowed (RBAC/ownership check failed).
	// Usage: throw errors.FORBIDDEN({ message: 'Not enough permission' })
	FORBIDDEN: {},
	// 429: Too many requests. Include retryAfter to help clients back off.
	// Usage: throw errors.TOO_MANY_REQUESTS({ data: { retryAfter: 30 } })
	TOO_MANY_REQUESTS: {
		data: z.object({
			retryAfter: z.number(),
		}),
	},
	// 500: Unexpected server error; default fallback in catch-all handlers.
	// Usage: throw errors.INTERNAL_SERVER_ERROR({ message: 'Unexpected error' })
	INTERNAL_SERVER_ERROR: {},
	// RATE_LIMITED is NOT a built-in common oRPC code.
	// If you need it, keep it as custom and ensure client/server handle it consistently.
	// RATE_LIMITED: {
	// 	data: z.object({ retryAfter: z.number() }),
	// },
	// 502: Upstream dependency failed.
	BAD_GATEWAY: {},
	// 504: Upstream timeout.
	GATEWAY_TIMEOUT: {},
	// 499: Client aborted request (proxy/server style code, optional).
	CLIENT_CLOSED_REQUEST: {},
	// 405: HTTP method not supported for this route.
	METHOD_NOT_SUPPORTED: {},
	// 406: Cannot satisfy requested Accept header/content negotiation.
	NOT_ACCEPTABLE: {},
	// 501: Endpoint exists but not implemented yet.
	NOT_IMPLEMENTED: {},
	// 413: Request body too large.
	PAYLOAD_TOO_LARGE: {},
	// 412: Preconditions failed (etag/version/if-match scenarios).
	PRECONDITION_FAILED: {},
	// 503: Service temporarily unavailable (maintenance/overload).
	SERVICE_UNAVAILABLE: {},
	// 408: Request timed out.
	TIMEOUT: {},
	// 422: Semantically invalid input (business rule violation).
	UNPROCESSABLE_CONTENT: {},
	// 415: Unsupported Content-Type or media format.
	UNSUPPORTED_MEDIA_TYPE: {},
});

const logMiddleware = base.middleware(
	async ({ context, next, errors, path, procedure }, input) => {
		// , context.reqHeaders 服务器运行时 为 undefined
		console.log('logMiddleware:', path, input);
		return next();
	},
);

export const Fn = base
	.route({})
	.use(logMiddleware)
	.use(({ context, next, procedure, path }) => {
		if (procedure['~orpc'].route.method === 'GET') {
			// console.log("GET:", path);
			context.resHeaders?.set(
				'cache-control',
				'public, max-age=10, s-maxage=10, stale-while-revalidate=60', // s-maxage：是给 CDN / 代理服务器 看的; max-age：是给浏览器看的
			);
		}
		return next();
	})
	.use(
		onError((error, { context, next, path, errors }, input, output) => {
			// Execute logic after the handler
			console.log('onError:');
			console.log({
				path,
				input,
				name: error.name,
				message: error.message,
				cause: error.cause,
				stack: error.stack,
			});
			if (error instanceof ORPCError) throw error; // 已经是 ORPCError 了，就直接抛出去，不需要再包装一层了
			throw errors.INTERNAL_SERVER_ERROR({
				message: error.message,
				cause: error.cause,
				data: {
					name: error.name,
					stack: error.stack,
				},
			});
		}),
	);
export const getFn = Fn.route({ method: 'GET' });

const authMiddleware = base.middleware(
	async ({ context, next, errors, path }) => {
		// context.reqHeaders ||
		const sessionData = await getSession();
		if (!sessionData?.session || !sessionData?.user) {
			throw errors.UNAUTHORIZED({
				message: 'Not Authorized',
			});
		}
		// Adds session and user to the context
		return next({
			context: {
				session: sessionData.session,
				user: sessionData.user,
			},
		});
	},
);
const authOrNotMiddleware = base.middleware(
	async ({ context, next, errors, path }) => {
		// context.reqHeaders ||
		const sessionData = await getSession();

		// Adds session and user to the context
		return next({
			context: {
				session: sessionData?.session,
				user: sessionData?.user,
			},
		});
	},
);
export const authFn = Fn.use(authMiddleware);
export const getAuthFn = authFn.route({ method: 'GET' });
export const authOrNotFn = Fn.use(authOrNotMiddleware);
export const getAuthOrNotFn = authOrNotFn.route({ method: 'GET' });

/**
 * @deprecated Use authFn instead
 */
export const authOS = authFn;

const adminMiddleware = base.middleware(async ({ context, next, errors }) => {
	const sessionData = await getSession();
	if (
		!sessionData?.session ||
		!sessionData?.user ||
		!(sessionData?.user.role === 'admin')
	) {
		throw errors.UNAUTHORIZED({
			message: 'Not an admin',
		});
	}
	// Adds session and user to the context
	return next({
		context: {
			session: sessionData.session,
			user: sessionData.user,
		},
	});
});
export const adminFn = Fn.use(adminMiddleware);
export const getAdminFn = adminFn.route({ method: 'GET' });
