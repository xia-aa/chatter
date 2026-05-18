import { createFileRoute } from '@tanstack/solid-router';
import { ScreenShare } from './-comp/ScreenShare.tsx';

export const Route = createFileRoute('/admin/screen-share/')({
	component: RouteComponent,
	ssr: false,
});

function RouteComponent() {
	return (
		<div class="max-w-4xl mx-auto p-6">
			<ScreenShare />
		</div>
	);
}
