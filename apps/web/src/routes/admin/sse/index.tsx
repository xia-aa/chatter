import { createFileRoute } from '@tanstack/solid-router';
import { ScreenShare } from '#/routes/admin/screen-share/-comp/ScreenShare.tsx';
import { ChatArea } from '#/routes/admin/sse/-comp/chat-area.tsx';

export const Route = createFileRoute('/admin/sse/')({
	component: RouteComponent,
	ssr: 'data-only',
});

function RouteComponent() {
	return (
		<main class="flex gap-2">
			<ChatArea />
			<ScreenShare />
		</main>
	);
}
