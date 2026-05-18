import { createFileRoute } from '@tanstack/solid-router';
import ChatArea from '#/routes/admin/sse/-comp/chat-area.tsx';

export const Route = createFileRoute('/admin/sse/')({
	component: RouteComponent,
	ssr: 'data-only',
});

function RouteComponent() {
	return <ChatArea />;
}
