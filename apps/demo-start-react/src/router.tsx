import { QueryClient } from '@tanstack/react-query';
import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { ErrorCard } from '#/components/app/error.tsx';
import { NotFound } from '#/components/app/NotFound.tsx';

import { routeTree } from './routeTree.gen';

export function getRouter() {
	const queryClient = new QueryClient();
	const router = createTanStackRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreload: 'intent',
		defaultPreloadStaleTime: 0,
		defaultErrorComponent: ErrorCard,
		defaultNotFoundComponent: ({ isNotFound, routeId, data }) => <NotFound />,
	});

	setupRouterSsrQueryIntegration({ router, queryClient });
	if (!router.isServer) {
		void import('@sentry/tanstackstart-react').then((Sentry) => {
			Sentry.init({
				dsn: 'https://9eb8d25395e661cbc902381b1d723cb4@o4511259394834432.ingest.us.sentry.io/4511259396800512',

				// Adds request headers and IP for users, for more info visit:
				// https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react/configuration/options/#sendDefaultPii
				sendDefaultPii: true,
			});
		});
	}
	return router;
}

declare module '@tanstack/react-router' {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
