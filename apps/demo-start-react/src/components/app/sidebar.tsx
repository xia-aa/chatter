import {
	ClientOnly,
	Link,
	type LinkOptions,
	type RegisteredRouter,
} from '@tanstack/react-router';
import { ChevronRight, FileIcon, Folder } from 'lucide-react';
import ParaglideLocaleSwitcher from '#/components/app/LocaleSwitcher.tsx';
import ThemeToggle from '#/components/app/ThemeToggle.tsx';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '#/components/ui/collapsible';
import { Separator } from '#/components/ui/separator';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarRail,
} from '#/components/ui/sidebar';
import { cn } from '#/lib/utils';
import BetterAuthHeader, { BetterAuthHeaderLoading } from './header-user';

// 叶子节点
type NavLeafNode = {
	title: string;
	link: LinkOptions<RegisteredRouter>['to'];
	href?: string;
	params?: LinkOptions<RegisteredRouter>['params'];
	children?: undefined;
};
type NavNode = {
	title: string;
	children: NavLeafNode[];
};
// 深度
type DemoNav = NavLeafNode | NavNode;
const getButtonPx = (depth: number) => ({
	paddingLeft: `${(2 + 6 * depth) * 0.25}rem`,
	paddingRight: `${(2 + 6 * depth) * 0.25}rem`,
});
function Tree({ item, depth = 0 }: { item: DemoNav; depth?: number }) {
	if (!item?.children) {
		return (
			<SidebarMenuButton asChild>
				{item.link ? (
					<Link
						to={item.link!}
						params={item.params}
						className={`rounded-none  `}
						style={getButtonPx(depth)}
					>
						<FileIcon />
						{item.title}
					</Link>
				) : (
					<a
						href={item.href}
						className={`rounded-none  `}
						style={getButtonPx(depth)}
					>
						<FileIcon />
						{item.title}
					</a>
				)}
			</SidebarMenuButton>
		);
	}

	return (
		<SidebarMenuItem>
			<Collapsible
				className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
				defaultOpen
			>
				<CollapsibleTrigger asChild>
					<SidebarMenuButton
						className={`rounded-none`}
						style={getButtonPx(depth)}
					>
						<ChevronRight className="transition-transform" />
						<Folder />
						{item.title}
					</SidebarMenuButton>
				</CollapsibleTrigger>

				<CollapsibleContent className="relative">
					<Separator
						orientation="vertical"
						className={cn(`absolute bg-accent-foreground z-1`)}
						style={{
							left: `${1 + 1.5 * depth}rem`, // 直接用 inline style，最可靠
						}}
					/>
					<SidebarMenuSub className="border-0 m-0 p-0">
						{item.children.map((child) => (
							<Tree key={child.title} item={child} depth={depth + 1} />
						))}
					</SidebarMenuSub>
				</CollapsibleContent>
			</Collapsible>
		</SidebarMenuItem>
	);
}

function flattenItems(nodes: DemoNav[]): DemoNav[] {
	const result: DemoNav[] = [];

	function walk(items: DemoNav[]) {
		for (const item of items) {
			if (item.children) {
				walk(item.children);
			} else if (item.link) {
				result.push(item);
			}
		}
	}

	walk(nodes);
	return result;
}
export function DemoSidebar() {
	const items: DemoNav[] = [
		{
			title: 'Demo',
			children: [
				{
					title: 'Todo',
					link: '/demo/todo',
				},
				{
					title: 'Chat',
					link: '/demo/chat',
					children: [
						{
							title: 'DM',
							link: '/demo/chat/dm',
						},
					],
				},
			],
		},
		{
			title: 'Integration', // integrations
			children: [
				{
					title: 'TanStack Store',
					link: '/integration/store',
				},
				{
					title: 'TanStack DB',
					children: [
						{
							title: 'tanstack-db Chat',
							link: '/integration/tanstack-db/chat',
						},
						{
							title: 'tanstack-db Error',
							link: '/integration/tanstack-db/error',
						},
					],
				},
				{
					title: 'TanStack Query',
					link: '/integration/tanstack-query',
				},
				{
					title: 'oRPC',
					children: [
						{
							title: 'oRPC Todo',
							link: '/integration/orpc/todo',
						},
						{
							title: 'OpenAPI',
							href: '/api',
						},
					],
				},
				{
					title: 'TanStack Form',
					children: [
						{ title: 'Simple Form', link: '/integration/form/simple' },
						{
							title: 'Address Form',
							link: '/integration/form/address',
						},
					],
				},
				{
					title: 'TanStack Table',
					link: '/integration/table',
				},
				// {
				// 	title: 'Neon',
				// 	link: '/demo/integration/neon',
				// },
				{
					title: 'Drizzle',
					link: '/integration/drizzle',
				},
				{
					title: 'Better Auth',
					children: [
						{ title: 'Sign In', link: '/integration/better-auth' },
						{
							title: 'OpenAPI',
							href: '/api/auth/reference',
						},
						{
							title: 'WebAuthn',
							link: '/integration/better-auth/webauthn',
						},
					],
				},
				{
					title: 'I18n paraglide',
					link: '/integration/i18n/paraglide',
				},

				// {
				// 	title: 'oRPC Batch',
				// 	link: '/demo/orpc_batch',
				// },

				// {
				// 	title: 'TanStack Query (Suspense)',
				// 	link: '/demo/rq_suspense',
				// },
				// {
				// 	link: '/demo/hook/useResizeObserver',
				// },
				// { link: '/demo/ui/stackModal' },
			],
		},
		{
			title: 'UI',
			children: [
				{
					title: 'Action',
					children: [
						{
							title: 'Button',
							link: '/ui/action/button',
						},
					],
				},
				{
					title: 'Display',
					children: [
						{
							title: 'Markdown',
							link: '/ui/display/md/',
						},
						{
							title: 'ProseMirror',
							link: '/ui/display/md/prosemirror/',
						},
					],
				},
			],
		},
		{
			title: 'Base',
			children: [
				{
					title: 'http/xhr',
					link: '/base/http/xhr',
				},
				{
					title: 's3',
					link: '/base/s3',
				},
			],
		},
	] as DemoNav[];
	return (
		<Sidebar mobileWidth="18rem">
			<SidebarHeader>
				<nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
					<div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-2 sm:w-auto sm:flex-nowrap sm:pb-0">
						<Link
							to="/"
							className="nav-link"
							activeOptions={{ exact: true }} // 要求精确匹配
							activeProps={{ className: 'nav-link is-active' }}
						>
							Home
						</Link>
						<a
							href="https://tanstack.com/start/latest/docs/framework/react/overview"
							className="nav-link"
							target="_blank"
							rel="noreferrer"
						>
							Docs
						</a>
						<details className="relative w-full sm:w-auto">
							<summary className="nav-link list-none cursor-pointer">
								Demos
							</summary>
							<div className="mt-2 min-w-56 rounded-xl border border-(--line) bg-(--header-bg) p-2 shadow-lg sm:absolute z-50">
								{flattenItems(items).map(
									(item) =>
										!item.children && (
											<Link
												key={item.link}
												to={item.link}
												params={item.params}
												className="block rounded-lg px-3 py-2 text-sm text-(--sea-ink-soft) no-underline transition hover:bg-(--link-bg-hover) hover:text-(--sea-ink)"
											>
												{item.title || item?.link?.replace('/demo/', '')}
											</Link>
										),
								)}
							</div>
						</details>
					</div>
				</nav>
			</SidebarHeader>
			<SidebarContent className="max-w-full overflow-hidden">
				{items.map((item) => (
					<Tree key={item.title} item={item} />
				))}
				{/* <SidebarGroup />
				<SidebarGroup /> */}
			</SidebarContent>
			<SidebarFooter className="flex-row  items-center justify-between">
				<ClientOnly fallback={<BetterAuthHeaderLoading />}>
					<BetterAuthHeader />
				</ClientOnly>
				<div className="flex items-center gap-x-2">
					<ParaglideLocaleSwitcher />
					<ThemeToggle />
				</div>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
