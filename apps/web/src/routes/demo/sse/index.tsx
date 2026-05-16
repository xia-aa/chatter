import { createFileRoute } from '@tanstack/solid-router';
import ChatArea from '#/routes/demo/sse/-comp/chat-area.tsx';

export const Route = createFileRoute('/demo/sse/')({
	component: RouteComponent,
	ssr: 'data-only',
});

function RouteComponent() {
	return <ChatArea />;
}
