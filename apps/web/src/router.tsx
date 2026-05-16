import { getQueryClient } from '@repo/shared/integrations/tanstack-query/provider';
import { ErrorCard } from '@repo/ui/app/error';
import { NotFound } from '@repo/ui/app/NotFound.tsx';
import { createRouter as createTanStackRouter } from '@tanstack/solid-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/solid-router-ssr-query';
import { routeTree } from './routeTree.gen';

export function getRouter() {
	const queryClient = getQueryClient();
	const router = createTanStackRouter({
		routeTree,

		context: { queryClient },

		scrollRestoration: true,
		defaultPreload: 'intent',
		defaultPreloadStaleTime: 0,
		defaultErrorComponent: ErrorCard,
		defaultNotFoundComponent: () => <NotFound />,
	});
	setupRouterSsrQueryIntegration({
		router,
		queryClient,
	});
	return router;
}

declare module '@tanstack/solid-router' {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
