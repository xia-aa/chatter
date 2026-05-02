import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { authOptions } from '#/lib/auth.query.ts';
import { DmSide } from '#/routes/demo/chat/_dm/-comp/DmSide.tsx';

export const Route = createFileRoute('/demo/chat/_dm')({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="min-w-0 grid grid-cols-[17rem_1fr] min-h-0 h-full">
			<DmSide />
			<div className="flex flex-col gap-2">
				<Outlet />
			</div>
		</div>
	);
}
