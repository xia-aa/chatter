import { createFileRoute, redirect } from '@tanstack/react-router';
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '#/components/ui/tabs.tsx';
import { AddFriend } from '#/routes/demo/chat/_dm/-comp/AddFriend.tsx';
import { FriendList } from '#/routes/demo/chat/_dm/-comp/FriendList.tsx';
import { PendingFriendList } from '#/routes/demo/chat/_dm/-comp/PendingFriendList.tsx';

export const Route = createFileRoute('/demo/chat/_dm/dm')({
	beforeLoad: async ({ context }) => {
		if (!context.user) {
			console.log('No session, redirecting to login');
			throw redirect({
				to: '/integration/better-auth',
				search: { callbackURL: '/demo/chat/dm' },
			});
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const user = Route.useRouteContext({ select: (ctx) => ctx.user });
	// friend list
	if (!user) {
		return <div>Loading...</div>;
	}
	return (
		<div>
			<Tabs defaultValue="all">
				<section className="h-12 p-2 flex w-full border-b">
					<TabsList className="p-0 rounded-none bg-transparent ">
						<TabsTrigger value="all">全部</TabsTrigger>
						<TabsTrigger value="pending">待定</TabsTrigger>
						<TabsTrigger value="add">添加好友</TabsTrigger>
					</TabsList>
				</section>
				<TabsContent value="all">
					<FriendList />
				</TabsContent>
				<TabsContent value="pending">
					<PendingFriendList meId={user.id} />
				</TabsContent>
				<TabsContent value="add">
					<AddFriend />
				</TabsContent>
			</Tabs>
		</div>
	);
}
