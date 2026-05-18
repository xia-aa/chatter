import { createSignal } from 'solid-js';
import { useChat, useMessages } from '#/routes/admin/sse/-comp/useChat.ts';
import Messages from './messages';

export function ChatArea() {
	const { sendMessage } = useChat();

	const messages = useMessages();

	const [message, setMessage] = createSignal('');
	const [user, setUser] = createSignal('Alice');

	const postMessage = () => {
		if (message().trim().length) {
			sendMessage(message(), user());
			setMessage('');
		}
	};

	const handleKeyPress = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			postMessage();
		}
	};

	return (
		<div class="flex flex-col h-full ">
			<div class="px-4 flex-1 py-6 space-y-4">
				<Messages messages={messages} user={user()} />
			</div>

			<div class=" border-t px-4 py-4">
				<div class="flex items-center space-x-3">
					<select
						value={user()}
						onInput={(e) => setUser(e.target.value)}
						class="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="Alice">Alice</option>
						<option value="Bob">Bob</option>
					</select>

					<div class="flex-1 relative">
						<input
							type="text"
							value={message()}
							onInput={(e) => setMessage(e.target.value)}
							onKeyDown={handleKeyPress}
							placeholder="Type a message..."
							class="w-full px-4 py-2 border  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>

					<button
						onClick={postMessage}
						disabled={message().trim() === ''}
						class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						Send
					</button>
				</div>
			</div>
		</div>
	);
}
