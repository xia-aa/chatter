import { TanStackDevtools } from '@tanstack/react-devtools';
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools';
import type { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
	useLocation,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { createServerFn } from '@tanstack/react-start';
import { getCookie } from '@tanstack/react-start/server';
import { Toaster } from 'sonner';
import { DemoHeader } from '#/components/app/Header.tsx';
import { DemoSidebar } from '#/components/app/sidebar.tsx';
import { ThemeProvider, useTheme } from '#/components/app/theme-provider.tsx';
import {
	SIDEBAR_COOKIE_NAME,
	SidebarProvider,
} from '#/components/ui/sidebar.tsx';
import { TooltipProvider } from '#/components/ui/tooltip.tsx';
import { ModalRenderer } from '#/components/uix/modal/renderer.tsx';
import { scrollbarDefault } from '#/css.ts';
import { authOptions } from '#/lib/auth.query.ts';
import { getLocale } from '#/paraglide/runtime.js';
import { DemoFooter } from '../components/app/Footer';
import StoreDevtools from '../lib/demo-store-devtools';
import appCss from '../styles.css?url';

interface MyRouterContext {
	queryClient: QueryClient;
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

const getSidebarOpen = createServerFn().handler(
	() => getCookie(SIDEBAR_COOKIE_NAME) !== 'false',
);
export const Route = createRootRouteWithContext<MyRouterContext>()({
	beforeLoad: async ({ context: { queryClient } }) => {
		const session = await queryClient.ensureQueryData(authOptions.session);
		// Other redirect strategies are possible; see
		// https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#offline-redirect
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('lang', getLocale());
		}
		return { user: session?.user || null };
	},
	loader: async ({ context }) => {
		return {
			sidebarOpen: await getSidebarOpen(),
		};
	},
	head: () => ({
		meta: [
			{
				charSet: 'utf-8',
			},
			{
				name: 'viewport',
				content: 'width=device-width, initial-scale=1',
			},
			{
				title: 'demo TanStack Start react',
			},
		],
		links: [
			{
				rel: 'stylesheet',
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const { sidebarOpen } = Route.useLoaderData();
	const pathname = useLocation({ select: (loc) => loc.pathname });
	const { theme, systemTheme } = useTheme();
	return (
		<html lang={getLocale()} suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
				<HeadContent />
			</head>
			<body className="font-sans antialiased wrap-anywhere h-svh overflow-hidden selection:bg-[rgba(79,184,178,0.24)]">
				<ThemeProvider>
					<TooltipProvider>
						<SidebarProvider defaultOpen={sidebarOpen}>
							<DemoSidebar />
							<div className="flex-1 flex h-svh max-h-svh min-h-svh flex-col overflow-hidden ">
								<DemoHeader />

								<div className={`flex-1 overflow-y-auto ${scrollbarDefault}`}>
									{children}
									{pathname === '/' && <DemoFooter />}
								</div>
							</div>
						</SidebarProvider>
						<ModalRenderer />
						<Toaster
							theme={theme === 'system' ? systemTheme : theme}
							position="top-right"
							richColors
							className="bg-transparent pointer-events-auto!"
							duration={60000}
							// style={{ pointerEvents: "auto" }}
						/>
					</TooltipProvider>
				</ThemeProvider>
				<TanStackDevtools
					config={{
						position: 'bottom-right',
					}}
					plugins={[
						{
							name: 'Tanstack Router',
							render: <TanStackRouterDevtoolsPanel />,
						},
						StoreDevtools,
						{
							name: 'Tanstack Query',
							render: <ReactQueryDevtoolsPanel />,
						},
						formDevtoolsPlugin(),
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
