import type { Collection } from '@tanstack/solid-db';
import { useLiveQuery } from '@tanstack/solid-db';
import { createEffect } from 'solid-js';
import { type Message, messagesCollection } from './message.sync.ts';

const chatApiPath = '/admin/sse/chat-api';
function useStreamConnection(
	url: string,
	collection: Collection<any, any, any>,
) {
	let loaded = false;
	createEffect(() => {
		const fetchData = async () => {
			if (loaded) return;
			loaded = true;

			const response = await fetch(url);
			const reader = response.body?.getReader();
			if (!reader) {
				return;
			}

			const decoder = new TextDecoder();
			while (true) {
				const { done, value } = await reader.read();

				if (done) break;
				for (const chunk of decoder
					.decode(value, { stream: true })
					.split('\n')
					.filter((chunk) => chunk.length > 0)) {
					console.log(chunk);
					collection.insert(JSON.parse(chunk));
				}
			}
		};
		fetchData();
	});
}

export function useChat() {
	useStreamConnection(chatApiPath, messagesCollection);

	const sendMessage = (message: string, user: string) => {
		fetch(chatApiPath, {
			method: 'POST',
			body: JSON.stringify({ text: message.trim(), user: user.trim() }),
		});
	};

	return { sendMessage };
}

export function useMessages() {
	const messages = useLiveQuery((q) =>
		q.from({ message: messagesCollection }).select(({ message }) => ({
			...message,
		})),
	);

	return messages();
}
