import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { BatchLinkPlugin } from '@orpc/client/plugins';
import type { RouterClient } from '@orpc/server';
import { createRouterClient } from '@orpc/server';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import { createIsomorphicFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { orpcRouter } from '#/orpc';

const getORPCClient = createIsomorphicFn()
	.server(() =>
		createRouterClient(orpcRouter, {
			context: () => ({
				headers: getRequestHeaders(),
			}),
		}),
	)
	.client((): RouterClient<typeof orpcRouter> => {
		const link = new RPCLink({
			url: `${window.location.origin}/api/rpc`,
			// method: ({ context }) => {
			// 	if (context?.cache) {
			// 		return "GET";
			// 	}

			// 	return "POST";
			// },
			method: ({ context }, path, args) => {
				// console.log("method", { path, args });
				// Use GET for cached responses
				if (context?.cache) {
					return 'GET';
				}

				// 1. 拿到对象中所有的 Symbol 键
				const symbols = Object.getOwnPropertySymbols(context);
				// 2. 找到那个描述为 "ORPC_OPERATION_CONTEXT" 的 Symbol
				const orpcSymbol = symbols.find(
					(s) => s.description === 'ORPC_OPERATION_CONTEXT',
				);
				if (orpcSymbol) {
					// 3. 访问并解构出 key
					const type = context[orpcSymbol].type;
					if (type === 'query') return 'GET';
				}
				return 'POST';
			},
			plugins: [
				new BatchLinkPlugin({
					groups: [
						{
							condition: ({ context }) => context?.cache === 'force-cache',
							context: {
								// This context will be passed to the fetch method
								cache: 'force-cache',
							},
						},
						{
							condition: (options) => true,
							context: {}, // Context used for the rest of the request lifecycle
						},
					],
				}),
			],
			fetch: (request, init, { context }) =>
				globalThis.fetch(request, {
					...init,
					cache: context?.cache,
				}),
		});
		return createORPCClient(link);
	});

export const client: RouterClient<typeof orpcRouter> = getORPCClient();

export const orpc = createTanstackQueryUtils(client);
