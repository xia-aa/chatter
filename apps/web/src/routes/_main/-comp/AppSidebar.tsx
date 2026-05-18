import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@repo/ui/base/dropdown-menu.tsx';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@repo/ui/base/sidebar.tsx';
import { ChevronDown, User2 } from 'lucide-solid';
import BetterAuthHeader from '#/lib/auth/header-user.tsx';

export function AppSidebar() {
	return (
		<Sidebar>
			<SidebarHeader>
				<SidebarMenu>Chatter</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup />
				<SidebarGroup />
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<BetterAuthHeader />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
