import { ClientOnly, createFileRoute } from '@tanstack/react-router';

import ChatArea from '#/routes/integration/tanstack-db/-comp/chat-area.tsx';

export const Route = createFileRoute('/integration/tanstack-db/chat')({
	component: App,
});

function App() {
	return (
		<ClientOnly>
			<ChatArea />
		</ClientOnly>
	);
}
