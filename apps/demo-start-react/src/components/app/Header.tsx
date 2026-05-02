import { Link } from '@tanstack/react-router';
import { SidebarTrigger, useSidebar } from '#/components/ui/sidebar';

export function DemoHeader() {
	const { isMobile } = useSidebar();
	return (
		<header className=" border-(--line)  backdrop-blur-lg p-4 h-8 flex items-center justify-between bg-sidebar shadow-lg">
			{isMobile ? (
				<SidebarTrigger
					variant="icon"
					size="default"
					className="[&_svg]:size-5 size-8"
				/>
			) : (
				<div />
			)}

			<h1 className="text-lg font-semibold">Demo</h1>
			<div></div>
		</header>
	);
}
