import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/demo/chat/')({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: session } = useQuery(authOptions.session);
	return (
		<div>
			Hello "/demo/chat/"!
			<MessageInput session={session} />
		</div>
	);
}

import { useQuery } from '@tanstack/react-query';
import { FileUpIcon, LoaderCircle, Plus, Send, SendIcon } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { MixIcon } from '#/components/icons';
import { Button } from '#/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu';
import { Textarea } from '#/components/ui/textarea';
import { usePathname } from '#/hooks/usePathname.ts';
import { authOptions } from '#/lib/auth.query.ts';
import type { AuthSession } from '#/lib/auth.ts';

function MessageInput({
	session,
	className = '',
}: {
	session?: AuthSession | null;
	className?: string;
}) {
	const pathname = usePathname();
	const [isSending, setIsSending] = useState(false);

	const handleSend = async () => {};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			console.log('Enter pressed', e.key);
			e.preventDefault();
			handleSend();
		}
	};
	return (
		<div className={`flex items-end m-2 mt-0 gap-2 ${className}`}>
			<Textarea
				placeholder="发送消息..."
				className="flex-1 border-0  focus-visible:ring-0 focus-visible:ring-offset-0 md:text-base resize-none min-h-6 max-h-52 overflow-y-auto"
				rows={1}
				onChange={(e) => {
					const target = e.target;
					target.style.height = 'auto';
					target.style.height = `${Math.min(target.scrollHeight, 208)}px`;
				}}
				onKeyDown={handleKeyDown}
				disabled={isSending}
			/>

			{/* // 如果未登录用户，显示登录提示 */}
			{!session ? (
				<Button className="h-10" color="primary">
					请登录后发送消息
				</Button>
			) : (
				<Button
					className="px-3 h-10"
					onClick={handleSend}
					color="primary"
					disabled={isSending}
				>
					<SendIcon className={`${isSending && 'animate-spin'}`} />
					{isSending ? '发送中...' : '发送'}
				</Button>
			)}
		</div>
	);
}
