import { ClientOnly, createFileRoute } from '@tanstack/solid-router';
import { ChatArea } from '#/routes/admin/sse/-comp/chat-area.tsx';
import ScreenShare from '#/routes/admin/w0/-comp/ScreenShare.tsx';

export const Route = createFileRoute('/admin/sse/')({
	component: RouteComponent,
	ssr: 'data-only',
});

function RouteComponent() {
	return (
		<main class="flex gap-2">
			<ClientOnly>
				<ChatArea />
				<ScreenShare />
			</ClientOnly>
		</main>
	);
}
