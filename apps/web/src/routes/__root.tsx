// import { TanStackDevtools } from '@tanstack/solid-devtools';
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from '@tanstack/solid-router';
// import {
// 	TanStackRouterDevtools,
// 	TanStackRouterDevtoolsPanel,
// } from '@tanstack/solid-router-devtools';
import '@fontsource/inter/400.css';
import {
	getLocale,
	shouldRedirect,
} from '@repo/shared/i18n/paraglide/runtime.js';
import { Devtools } from '@repo/ui/app/devtools';
import styleCss from '@repo/ui/styles.css?url';
import { ThemeProvider, themeScript } from '@repo/ui/theme';
import type { QueryClient } from '@tanstack/query-core';
// import { formDevtoolsPlugin } from '@tanstack/solid-form-devtools';
// import { SolidQueryDevtoolsPanel } from '@tanstack/solid-query-devtools';
import { Suspense } from 'solid-js';
import { HydrationScript } from 'solid-js/web';
import { sessionQuery } from '#/lib/auth/auth.query.ts';
import Header from '../components/Header';

interface MyRouterContext {
	queryClient: QueryClient;
}
export const Route = createRootRouteWithContext<MyRouterContext>()({
	beforeLoad: async ({ context: { queryClient } }) => {
		const session = await queryClient.ensureQueryData(sessionQuery);
		// Other redirect strategies are possible; see
		// https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#offline-redirect
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('lang', getLocale());
		}
		return { user: session?.user || null };
	},
	head: () => ({
		links: [
			{ rel: 'stylesheet', href: styleCss },
			{
				rel: 'icon',
				type: 'image/svg+xml',
				href: '/favicon.svg',
				sizes: 'any',
			},
		],
		scripts: [{ children: themeScript }],
	}),
	shellComponent: RootComponent,
	ssr: true,
});

function RootComponent() {
	return (
		<html lang={getLocale()}>
			<head>
				<HydrationScript />
				<HeadContent />
			</head>
			<body>
				<Suspense>
					<ThemeProvider>
						<Header />
						<Outlet />
					</ThemeProvider>
					<Devtools />
					{/* <TanStackDevtools
						plugins={[
							{
								name: 'Tanstack Router',
								render: <TanStackRouterDevtoolsPanel />,
							},
							// storeDevtools,
							{
								name: 'Tanstack Query',
								render: <SolidQueryDevtoolsPanel />,
							},
							formDevtoolsPlugin(),
						]}
					/> */}
				</Suspense>
				<Scripts />
			</body>
		</html>
	);
}
