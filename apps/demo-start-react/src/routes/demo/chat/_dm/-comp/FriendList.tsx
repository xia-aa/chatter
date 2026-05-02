import { eq, useLiveQuery } from '@tanstack/react-db';
import { ActionDiv } from '#/components/uix/button/button.c.tsx';
import { Text } from '#/components/uix/html.tsx';
import {
	AvatarWithStatus,
	StatusAvatar,
} from '#/components/uix/img/StatusAvatar.tsx';
import { friendCollect } from '#/features/friend/friend.collect.ts';
import { userCollect } from '#/features/user/user.collect.ts';

export function FriendList() {
	const { data: friends } = useLiveQuery((q) =>
		q.from({ friend: friendCollect }).innerJoin(
			{
				user: userCollect,
			},
			({ friend, user }) => eq(friend.userId, user.id),
		),
	);
	return (
		<div className="flex flex-col gap-2 px-3">
			<span className="p-1">好友总数: {friends.length}</span>
			<ul>
				{friends.map((friend) => (
					<li
						key={friend.friend.id}
						className="group border-t p-2 hover:bg-accent/50 rounded-md"
					>
						<ActionDiv className="flex gap-2">
							<AvatarWithStatus
								src={friend.user.image}
								// onlineStatus={getUserStatus(friend.user.id)}
							/>
							<div className="">
								<Text className="font-semibold">
									{friend.friend.nickname ||
										friend.user.displayUsername ||
										friend.user.username}
									<span className={`hidden font-normal group-hover:inline`}>
										{friend.user.username}
									</span>
								</Text>
								<div className="text-xs text-muted-foreground min-w-0 w-fit">
									在线
								</div>
							</div>
						</ActionDiv>
					</li>
				))}
			</ul>
		</div>
	);
}
