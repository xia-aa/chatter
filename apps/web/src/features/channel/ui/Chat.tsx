'use client';

import { eq, useLiveInfiniteQuery, useLiveQuery } from '@tanstack/react-db';
import { useQuery } from '@tanstack/react-query';
import type { z } from 'better-auth';
import { Form, Send } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useStickToBottom } from 'use-stick-to-bottom';
import { useIntersectionObserver } from 'usehooks-ts';
import { Button } from '#/components/ui/button';
import { Field, FieldDescription, FieldError } from '#/components/ui/field';
import {
	InputGroupAddon,
	InputGroupTextarea,
} from '#/components/ui/input-group';
import { Textarea } from '#/components/ui/textarea';
import { useAppForm } from '#/components/uix/form/useAppForm.tsx';
import { AvatarWithStatus } from '#/components/uix/img/StatusAvatar.tsx';
import { Loading } from '#/components/uix/loading.tsx';

import { TextPreview } from '#/components/uix/prosemirror/preview.tsx';
import {
	findBlobUrls,
	replaceUrlsInContent,
} from '#/components/uix/prosemirror/utils.tsx';
import { sendMessageSchema } from '#/features/channel/message.schema.ts';
import {
	type MessageRow,
	type MessageWithUser,
	messageCollect,
	messageOpt,
} from '#/features/channel/message.sync.ts';
import { MessageInput } from '#/features/channel/ui/MessageInput.tsx';
import {
	listUserByIdsQ,
	type UserRow,
	userCollect,
	userOpt,
} from '#/features/user/user.sync.ts';
import { authQuery } from '#/lib/auth/auth.query.ts';
import type { AuthSession } from '#/lib/auth/config.ts';
import { useFileUpload } from '#/lib/upload/useFileUpload.ts';
import { cn } from '#/lib/utils';
import { formatToNow } from '#/lib/utils.timeFormat.ts';
import { useSocketIo, useUserStatus } from '#/lib/ws.provider.ts';
import type { OnlineStatus } from '#/lib/ws.ts';

type ChatProps = {
	channel_id?: string;
	room_id?: string;
	className?: string;
	session?: AuthSession | null;
};

export function Chat({ channel_id, room_id, className, session }: ChatProps) {
	const target = channel_id
		? ({ type: 'channel', id: channel_id } as const)
		: room_id
			? ({ type: 'room', id: room_id } as const)
			: null;

	const {
		data: messages,
		isLoading,
		status,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useLiveInfiniteQuery((q) => messageOpt.list(target), { pageSize: 50 });

	const ids = messages
		.map((msg) => msg?.user_id)
		.filter((id) => id !== undefined && id !== null);
	const { data: users } = useLiveQuery(listUserByIdsQ(ids));
	const usersKv = useMemo(() => {
		const kv: Record<string, Partial<UserRow>> = {};
		users?.forEach((u) => {
			if (u.id) {
				kv[u.id] = u;
			}
		});
		return kv;
	}, [users]);

	const { getUserStatus } = useUserStatus(ids);
	const { scrollRef, contentRef, isAtBottom, scrollToBottom } =
		useStickToBottom();

	const [newMsgCount, setNewMsgCount] = useState(0);
	const prevLenRef = useRef(messages.length);

	const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver({
		threshold: 0.1,
	});

	useEffect(() => {
		if (!isAtBottom) {
			const delta = messages.length - prevLenRef.current;
			if (delta > 0) {
				setNewMsgCount((n) => n + delta);
			}
		}
		prevLenRef.current = messages.length;
	}, [messages.length, isAtBottom]);

	useEffect(() => {
		if (isIntersecting && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

	const handleScrollToBottom = () => {
		scrollToBottom();
		setNewMsgCount(0);
	};

	if (!target) {
		return (
			<section
				className={cn('flex h-full items-center justify-center', className)}
			>
				<p className="text-sm text-muted-foreground">请选择一个聊天频道</p>
			</section>
		);
	}

	return (
		<section className={cn('relative flex flex-1 min-h-0 flex-col', className)}>
			<div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-3">
				<div ref={contentRef} className="space-y-3">
					<div ref={loadMoreRef} className="h-1 w-full" />

					{isLoading ||
						(isFetchingNextPage && messages.length > 0 && (
							<div className="py-2 text-center text-xs text-muted-foreground">
								加载中...
							</div>
						))}

					{!isLoading && messages.length === 0 && !isFetchingNextPage && (
						<div className="py-6 text-center text-sm text-muted-foreground">
							还没有消息，发一条吧
						</div>
					)}

					{messages.map((msg) => (
						<MessageItem
							key={msg.id}
							msg={msg}
							user={msg.user_id ? usersKv[msg.user_id] : undefined}
							userId={session?.user?.id}
							onlineStatus={getUserStatus(msg?.user_id)}
						/>
					))}
				</div>
			</div>

			{!isAtBottom && newMsgCount > 0 && (
				<button
					onClick={handleScrollToBottom}
					className="absolute bottom-28 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-sm"
				>
					{newMsgCount}
				</button>
			)}

			<MessageInput session={session} target={target} />
		</section>
	);
}

function MessageItem({
	onlineStatus,
	...p
}: {
	msg: MessageRow;
	user?: Partial<UserRow>;
	userId?: string;
	onlineStatus?: OnlineStatus;
}) {
	const isMe = p.msg.user_id === p.userId;
	const image = p.msg.sender_avatar || p.user?.image;
	const name =
		p.msg.sender_name ||
		p.user?.displayUsername ||
		p.user?.username ||
		'用户已注销';
	return (
		<article
			className={`flex gap-2 py-0.5 px-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
		>
			<AvatarWithStatus src={image} name={name} status={onlineStatus} />
			<section className={`flex flex-col w-full ${isMe ? 'items-end' : ''}`}>
				<span
					className={`inline-flex gap-1 h-5 items-center ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
				>
					{name}
					<span className="text-muted-foreground">
						{formatToNow(p.msg.created_at)}
					</span>
				</span>
				<div className="flex">
					{!p.msg.$synced && <Loading className="m-1.25 size-6 text-primary" />}
					{p.msg.content && (
						<TextPreview
							className="bg-secondary p-2 h-fit rounded-md"
							md={p.msg.content}
						/>
					)}
				</div>
			</section>
		</article>
	);
}
