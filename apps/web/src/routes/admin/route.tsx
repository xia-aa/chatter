// import {
// 	SidebarProvider,
// 	SidebarTrigger,
// } from '@repo/ui/base/sidebar.tsx';

import { SidebarProvider, SidebarTrigger } from '@repo/ui/base/sidebar';
import { createFileRoute, Outlet } from '@tanstack/solid-router';
import { adminBeforeLoad } from '#/lib/middleware/authBeforeLoad.ts';
import { AdminSidebar } from '#/routes/admin/-comp/AppSidebar.tsx';
// import { AdminSidebar } from '#/routes/admin/-components/layout/sidebar';

export const Route = createFileRoute('/admin')({
	loader: async ({ context: { user } }) => adminBeforeLoad(user),
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<SidebarProvider>
			<AdminSidebar />
			<div class="w-full h-screen grid grid-rows-[auto_1fr]">
				<header>
					<SidebarTrigger />
				</header>
				<Outlet />
			</div>
		</SidebarProvider>
	);
}
