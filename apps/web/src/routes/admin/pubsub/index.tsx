import { Button } from '@repo/ui/base/button';
import { ClientOnly, createFileRoute } from '@tanstack/solid-router';
import { createSignal } from 'solid-js';
import { usePubSub } from './-lib/usePubSub';

const API_PATH = '/admin/pubsub/api';

export const Route = createFileRoute('/admin/pubsub/')({
	component: () => (
		<ClientOnly>
			<RouteComponent />
		</ClientOnly>
	),
});

function RouteComponent() {
	const [topic, setTopic] = createSignal('default');
	const [text, setText] = createSignal('Hello');
	const { lastMessage, publish, status } = usePubSub(API_PATH, topic);

	return (
		<main class="p-4 space-y-4">
			<h1 class="text-xl font-bold">PubSub Test</h1>
			<div class="text-sm text-gray-600">Status: {status()}</div>

			<div class="flex flex-col gap-2 max-w-md">
				<label class="text-sm">
					Topic
					<input
						class="w-full border rounded px-2 py-1"
						value={topic()}
						onInput={(e) => setTopic(e.currentTarget.value)}
					/>
				</label>
				<label class="text-sm">
					Message
					<input
						class="w-full border rounded px-2 py-1"
						value={text()}
						onInput={(e) => setText(e.currentTarget.value)}
					/>
				</label>
				<Button onClick={() => publish(text())}>Send</Button>
			</div>

			<div class="rounded border p-3 text-sm">
				Last message: {lastMessage()?.topic ?? '-'} /{' '}
				{lastMessage()?.text ?? '-'}
			</div>
		</main>
	);
}
