import { ClientOnly, createFileRoute } from '@tanstack/solid-router';
import ScreenShare from './-comp/ScreenShare.tsx';

export const Route = createFileRoute('/admin/w0/')({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div class="max-w-4xl mx-auto p-6">
			<ClientOnly>
				<ScreenShare />
			</ClientOnly>
		</div>
	);
}
