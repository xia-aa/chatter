import { createFileRoute } from '@tanstack/react-router';
import { cn } from '#/lib/utils';

export const Route = createFileRoute('/ui/action/button')({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="flex flex-col gap-2">Hello "/demo/ui/action/button"!</main>
	);
}
