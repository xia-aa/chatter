import { SidebarProvider, SidebarTrigger } from '@repo/ui/base/sidebar';
import { createFileRoute, Outlet } from '@tanstack/solid-router';
import { AppSidebar } from '#/routes/_main/-comp/AppSidebar.tsx';

export const Route = createFileRoute('/_main')({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<div class="w-full h-screen grid grid-rows-[auto_1fr]">
				<header>
					<SidebarTrigger />
				</header>
				<Outlet />
			</div>
		</SidebarProvider>
	);
}
