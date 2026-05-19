import { ClientOnly, createFileRoute } from '@tanstack/solid-router';

export const Route = createFileRoute('/admin/s1/')({
	component: RouteComponent,
	ssr: 'data-only',
});

import { ScreenShare } from './-comp/ScreenShare.tsx';

function RouteComponent() {
	return (
		<ClientOnly>
			<div class="max-w-4xl mx-auto p-6">
				<ScreenShare />
			</div>
		</ClientOnly>
	);
}
