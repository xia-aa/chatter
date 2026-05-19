import { createEffect, createSignal, onCleanup } from 'solid-js';

export interface PubSubMessage {
	type: 'message' | 'ping';
	topic?: string;
	text?: string;
	ts?: number;
}

export function usePubSub(apiPath: string, topic: () => string) {
	const [lastMessage, setLastMessage] = createSignal<PubSubMessage | null>(
		null,
	);
	const [status, setStatus] = createSignal('Connecting...');

	let sseReader: ReadableStreamDefaultReader | undefined;
	let cancelled = false;

	createEffect(() => {
		cancelled = false;
		const currentTopic = topic();
		const connect = async () => {
			while (!cancelled) {
				try {
					const response = await fetch(
						`${apiPath}?topic=${encodeURIComponent(currentTopic)}`,
					);
					const reader = response.body?.getReader();
					if (!reader || cancelled) return;
					sseReader = reader;
					setStatus('Connected');
					const decoder = new TextDecoder();
					while (!cancelled) {
						const { done, value } = await reader.read();
						if (done) break;
						for (const line of decoder
							.decode(value, { stream: true })
							.split('\n')
							.filter(Boolean)) {
							if (cancelled) break;
							const msg = JSON.parse(line) as PubSubMessage;
							if (msg.type === 'ping') continue;
							setLastMessage(msg);
						}
					}
					setStatus('Disconnected, reconnecting...');
					await new Promise((r) => setTimeout(r, 500));
				} catch {
					setStatus('Error, reconnecting...');
					await new Promise((r) => setTimeout(r, 1000));
				}
			}
		};
		connect();

		onCleanup(() => {
			cancelled = true;
			sseReader?.cancel();
		});
	});

	const publish = (text: string) =>
		fetch(apiPath, {
			method: 'POST',
			body: JSON.stringify({
				type: 'message',
				topic: topic(),
				text,
				ts: Date.now(),
			}),
		});

	return { lastMessage, publish, status };
}
