import { TanStackDevtools } from '@tanstack/solid-devtools';
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from '@tanstack/solid-router';
import {
	TanStackRouterDevtools,
	TanStackRouterDevtoolsPanel,
} from '@tanstack/solid-router-devtools';
import '@fontsource/inter/400.css';
import { ThemeProvider, themeScript } from '@repo/ui/theme';
import { formDevtoolsPlugin } from '@tanstack/solid-form-devtools';
import { SolidQueryDevtoolsPanel } from '@tanstack/solid-query-devtools';
import { Suspense } from 'solid-js';
import { HydrationScript } from 'solid-js/web';
import Header from '../components/Header';
import styleCss from '../styles.css?url';

export const Route = createRootRouteWithContext()({
	head: () => ({
		links: [{ rel: 'stylesheet', href: styleCss }],
		scripts: [{ children: themeScript }],
	}),
	shellComponent: RootComponent,
});

function RootComponent() {
	return (
		<ThemeProvider>
			<html lang="en">
				<head>
					<HydrationScript />
					<HeadContent />
				</head>
				<body>
					<Suspense>
						<Header />
						<Outlet />
						<TanStackDevtools
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
						/>
					</Suspense>
					<Scripts />
				</body>
			</html>
		</ThemeProvider>
	);
}
