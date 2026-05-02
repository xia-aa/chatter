import { eq, useLiveQuery } from '@tanstack/react-db';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '#/components/ui/popover.tsx';
import { ExpandableText } from '#/components/uix/ExpandableText.tsx';
import { AvatarWithStatus } from '#/components/uix/img/StatusAvatar.tsx';
import { linkCss, scrollbarDefault } from '#/css.ts';
import { friendCollect } from '#/features/friend/friend.collect.ts';
import { AddFriendButton } from '#/features/friend/ui/AddFriendButton.tsx';
import {
	profileCollect,
	userCollect,
	userQuery,
} from '#/features/user/user.collect.ts';
import { authOptions } from '#/lib/auth.query.ts';
import { cn, css } from '#/lib/utils.ts';
export function Banner({
	bannerUrl,
	bannerColor = '#a6e3a1',
	className,
}: {
	bannerUrl?: string;
	bannerColor?: string | null;
	className?: string;
}) {
	return (
		<div
			className={cn(
				`relative h-25 w-full bg-cover bg-center bg-primary`,
				className,
			)}
			style={{
				backgroundColor: bannerUrl ? undefined : bannerColor || '#a6e3a1',
				backgroundImage: bannerUrl ? `url(${bannerUrl})` : undefined,
			}}
		/>
	);
}
export function UserCard({ id }: { id: string }) {
	console.log('UserCardInner');
	const { data: session } = useQuery(authOptions.session);
	// const { data: user } = useQuery(orpc.getUser.queryOptions({ input: { id } }));
	const { data: user } = useLiveQuery(userQuery.detail(id));
	// const { data: identities } = useQuery(
	// 	orpc.listIdentity.queryOptions({ input: { userId: id } }),
	// );
	// const { data: friend } = useQuery(
	// 	orpc.getFriend.queryOptions({ input: { id } }),
	// );
	const { data: friend } = useLiveQuery((q) =>
		q
			.from({ friend: friendCollect })
			.where(({ friend }) => eq(friend.friendId, id))
			.findOne(),
	);

	const isSelf = session && session.user.id === user?.user.id;
	// const { status } = useSocketIo();
	// const { getUserStatus } = useUserStatus(isSelf ? [] : [id]); // 为空时不会调用
	if (!user) return <div>用户不存在</div>;
	const isFriend = !!friend;
	const hasFriendNickname = isFriend && friend.nickname;
	const name = hasFriendNickname
		? friend.nickname
		: user.user.name || user.user.username;
	// const onlineStatus = isSelf ? status : getUserStatus(id);
	return (
		<div className="bg-card shadow-2xl rounded-lg overflow-hidden w-75">
			{/* <UserStatusEffect ids={ids} /> */}
			<div>
				<Banner bannerColor={user.profile?.color} />
				<div className="relative h-12.5">
					<button
						className="absolute -top-11.5 left-4 cursor-pointer"
						// onClick={() => openUserModal(id)}
					>
						<AvatarWithStatus
							// status={onlineStatus}
							src={user.user?.image}
							name={user.user?.displayUsername || user.user?.username}
							size="xl"
							className={cn('border-[6px] border-card')}
						/>
					</button>
				</div>
			</div>
			<div className="px-4 pb-2 pt-1 flex flex-col gap-3">
				<div>
					<button
						className={css(linkCss, 'h-6 text-xl font-bold block')}
						// onClick={() => openUserModal(id)}
					>
						{user.user?.displayUsername || user.user?.username}
					</button>
					<button
						className={css(
							linkCss,
							'h-5 text-sm font-normal  flex items-center gap-2',
						)}
						// onClick={() => openUserModal(id)}
					>
						{user.user?.username}
						{/* <UserIdentityIcons identities={identities} /> */}
					</button>
				</div>
				{user.profile?.summary && (
					<div data-slot="bio">
						<ExpandableText
							textClassName={`max-h-28 overflow-y-auto ${scrollbarDefault}`}
						>
							{user.profile.summary}
						</ExpandableText>
					</div>
				)}
			</div>
			<div className="px-4 pb-3">
				{!isSelf && !isFriend && <AddFriendButton id={id} />}
			</div>
		</div>
	);
}

export function UserCardPopover({
	id,
	children,
	asChild,
	className = '',
}: {
	id: string;
	children: ReactNode;
	asChild?: boolean;
	className?: string;
}) {
	const prefetch = () => userQuery.detail(id).preload();
	return (
		<Popover>
			<PopoverTrigger
				asChild={asChild}
				className={cn('cursor-pointer', className)}
				onMouseEnter={prefetch}
				onFocus={prefetch}
			>
				{children}
			</PopoverTrigger>
			<PopoverContent align="start" className="z-100">
				<UserCard id={id} />
			</PopoverContent>
		</Popover>
	);
}
