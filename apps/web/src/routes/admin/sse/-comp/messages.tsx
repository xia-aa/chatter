import type { Message } from '#/routes/admin/sse/-comp/message.sync.ts';

export const getAvatarColor = (username: string) => {
	const colors = [
		'bg-blue-500',
		'bg-green-500',
		'bg-purple-500',
		'bg-pink-500',
		'bg-indigo-500',
		'bg-red-500',
		'bg-yellow-500',
		'bg-teal-500',
	];
	const index = username
		.split('')
		.reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return colors[index % colors.length];
};

export default function Messages(p: { messages: Message[]; user: string }) {
	return (
		<>
			{p.messages.map((msg: Message) => (
				<div
					class={`flex ${msg.user === p.user ? 'justify-end' : 'justify-start'}`}
				>
					<div
						class={`flex items-start space-x-3 max-w-xs lg:max-w-md ${
							msg.user === p.user ? 'flex-row-reverse space-x-reverse' : ''
						}`}
					>
						<div
							class={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(
								msg.user,
							)}`}
						>
							{msg.user.charAt(0).toUpperCase()}
						</div>

						<div
							class={`px-4 py-2 rounded-md ${
								msg.user === p.user
									? 'bg-blue-500 text-white'
									: 'bg-white text-gray-800 border border-gray-200 '
							}`}
						>
							{msg.user !== p.user && (
								<p class="text-xs text-gray-500 mb-1 font-medium">{msg.user}</p>
							)}
							<p class="text-sm">{msg.text}</p>
						</div>
					</div>
				</div>
			))}
		</>
	);
}
