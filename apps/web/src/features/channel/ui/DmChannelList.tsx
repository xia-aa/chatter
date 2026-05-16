'use client';

import { eq, useLiveQuery } from '@tanstack/react-db';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { ActionDiv } from '#/components/uix/button/button.c';
import { Text } from '#/components/uix/html';
import {
	AvatarWithStatus,
	StatusAvatar,
} from '#/components/uix/img/StatusAvatar';
import { Skeleton } from '#/components/uix/loading';
import { scrollbarDefault } from '#/css';
import type { ListDmRoomOut } from '#/features/channel/channel.server.ts';
import {
	dmMemberCollect,
	dmMemberOptions,
} from '#/features/channel/dmMember.sync.ts';
import {
	type DmRoomListItem,
	dmRoomCollect,
	dmRoomOptions,
} from '#/features/channel/dmRoom.sync.ts';
import { messageCollect } from '#/features/channel/message.sync.ts';
import { userCollect } from '#/features/user/user.sync.ts';
import { authQuery } from '#/lib/auth/auth.query.ts';
import { cn } from '#/lib/utils';
import { useSocketIo, useUserStatus } from '#/lib/ws.provider';
import { orpc } from '#/orpc._client';

export function DmChannelItemSkeleton({
	isPulse,
	className,
}: {
	isPulse?: boolean;
	className?: string;
}) {
	return (
		<div className="flex items-center p-2 h-10.5 gap-2">
			<Skeleton
				className={cn('size-8 rounded-full', className)}
				isPulse={isPulse}
			/>
			<div className="space-y-1">
				<Skeleton className={cn('h-3.5 w-20', className)} isPulse={isPulse} />
				<Skeleton className={cn('h-3.5 w-40', className)} isPulse={isPulse} />
			</div>
		</div>
	);
}

function DmChannelListInner() {
	const { data: session } = useQuery(authQuery.session);
	const { data } = useLiveQuery(dmRoomOptions.list());
	const userIds = data
		.filter((i) => i.type === 'single')
		.flatMap(
			(i) => i.members.map((m) => m.user_id).filter(Boolean) as string[],
		);
	const { statuses } = useUserStatus(userIds);
	return (
		<ul className="py-2">
			{data.map((item) => {
				return <DmChannelItem key={item.id} id={item.id} />;
			})}
			{data.length === 0 && (
				<>
					<DmChannelItemSkeleton isPulse={false} className={`bg-accent`} />
					<DmChannelItemSkeleton isPulse={false} className={`bg-accent/90`} />
					<DmChannelItemSkeleton isPulse={false} className={`bg-accent/80`} />
					<DmChannelItemSkeleton isPulse={false} className={`bg-accent/70`} />
					<DmChannelItemSkeleton isPulse={false} className={`bg-accent/60`} />
					<DmChannelItemSkeleton isPulse={false} className={`bg-accent/50`} />
					<DmChannelItemSkeleton isPulse={false} className={`bg-accent/40`} />
					<DmChannelItemSkeleton isPulse={false} className={`bg-accent/30`} />
					<DmChannelItemSkeleton isPulse={false} className={`bg-accent/20`} />
					<DmChannelItemSkeleton isPulse={false} className={`bg-accent/10`} />
				</>
			)}
		</ul>
	);
}
export const DmChannelList = () => (
	<section className={cn('min-h-0 overflow-y-auto', scrollbarDefault)}>
		<Suspense
			fallback={
				<ul>
					{[...Array(10)].map((_, i) => (
						<DmChannelItemSkeleton key={i} />
					))}
				</ul>
			}
		>
			<DmChannelListInner />
		</Suspense>
	</section>
);

const DmChannelItem = ({ id }: { id: string }) => {
	const { data: session } = useQuery(authQuery.session);
	const { statuses } = useSocketIo();
	const { data: members } = useLiveQuery(dmMemberOptions.select(id));
	const otherMember = members.find((m) => m.user_id !== session?.user?.id);
	const user = otherMember?.user;

	if (!user) return null;

	return (
		<li className="group border-t p-2 hover:bg-accent/50 rounded-md min-w-0">
			<ActionDiv className="flex gap-2">
				<AvatarWithStatus src={user.image} status={statuses[user.id]} />
				<div className="">
					<Text className="font-semibold">
						{otherMember?.nickname || user.displayUsername || user.username}
						<span className={`hidden font-normal group-hover:inline`}>
							{user.username}
						</span>
					</Text>
				</div>
			</ActionDiv>
		</li>
	);
};
