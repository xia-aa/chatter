// import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
// import { Link } from '@tanstack/react-router';
// import { Pencil, UserRoundPlus } from 'lucide-react';
// import { ErrorCard } from '#/components/app/error';
// import { Badge } from '#/components/ui/badge';
// import { Button } from '#/components/ui/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs';

// import {
// 	AvatarWithStatus,
// 	StatusAvatar,
// } from '#/components/uix/img/StatusAvatar';
// import { Loading } from '#/components/uix/loading';
// import { closeModal, openModal } from '#/components/uix/modal/renderer';
// import { TeamItemUI } from '#/features/team/ui/TeamUi';
// import { openTeamModal } from '#/features/team/ui/team.Modal';
// import { Banner, UserIdentityIcons } from '#/features/user/user.Card';
// import { UserProjectList } from '#/features/user/user.project';
// import { authQ } from '#/lib/auth.rq';
// import { cn, css } from '#/lib/utils';
// import { useSocketIo, useUserStatus } from '#/lib/ws.provider';
// import { orpc } from '#/orpc._client';

// export const openUserModal = (id: string) =>
// 	openModal(<UserModal id={id} />, {
// 		size: 'auto',
// 		className: 'p-0 sm:w-160 md:w-[calc(100%-64px)] lg:w-240',
// 		showCloseButton: false,
// 	});

// export const UserModal = ({ id }: { id: string }) => {
// 	const { data: session } = useQuery(authQ.session);
// 	const {
// 		data: user,
// 		isLoading,
// 		error,
// 		refetch,
// 	} = useQuery(orpc.getUser.queryOptions({ input: { id } }));
// 	const { data: identities } = useQuery(
// 		orpc.listIdentity.queryOptions({ input: { userId: id } }),
// 	);
// 	const { data: projects } = useQuery(
// 		orpc.listUserProject.queryOptions({
// 			input: {
// 				userId: id,
// 			},
// 		}),
// 	);

// 	const { data: userProjectsStats } = useQuery(
// 		orpc.statUserProject.queryOptions({
// 			input: {
// 				userId: id,
// 			},
// 		}),
// 	);
// 	const { data: friend } = useQuery(
// 		orpc.getFriend.queryOptions({ input: { id } }),
// 	);
// 	const isSelf = session && session.user.id === id;
// 	const { data: teams } = useQuery(
// 		orpc.listCommonTeam.queryOptions({
// 			input: {
// 				userId: id,
// 			},
// 			enabled: !isSelf,
// 		}),
// 	);
// 	const { status } = useSocketIo();

// 	const ids = isSelf ? [] : [id];
// 	const { getUserStatus } = useUserStatus(ids);
// 	if (isLoading) return <Loading className="text-primary" />;
// 	if (error) return <ErrorCard error={error} reset={refetch} />;

// 	if (!user) return <div>用户不存在</div>;
// 	const isFriend = !!friend;
// 	const hasFriendNickname = isFriend && friend.nickname;
// 	const name = hasFriendNickname ? friend.nickname : user.name || user.username;
// 	const onlineStatus = isSelf ? status : getUserStatus(id);
// 	return (
// 		<div
// 			data-slot="user-modal"
// 			className="flex w-full md:p-4 h-200 lg:pt-10 lg:pl-10 lg:pr-6  sm:p-4 sm:gap-2 md:gap-3 lg:gap-5 pb-0! sm:flex-row flex-col"
// 		>
// 			<div
// 				data-slot="user-card"
// 				className="bg-card shadow-2xl rounded-lg sm:rounded-b-none  overflow-hidden w-100 sm:min-w-75 md:min-w-100 "
// 			>
// 				<div>
// 					<Banner bannerColor={user?.color} />
// 					<div className="relative h-12.5">
// 						<div className="absolute -top-11.5 left-4">
// 							<AvatarWithStatus
// 								status={onlineStatus}
// 								src={user?.image}
// 								name={user?.displayUsername || user?.username}
// 								size="xl"
// 								className={css('border-[6px] border-card')}
// 							/>
// 						</div>
// 					</div>
// 				</div>
// 				<div className="px-4 pb-2 pt-1 flex flex-col gap-3">
// 					<div>
// 						<div className="h-6 text-xl font-bold">{name}</div>
// 						<div className="h-5 text-sm font-normal flex items-center gap-2">
// 							{user?.username} <UserIdentityIcons identities={identities} />
// 						</div>
// 					</div>
// 				</div>
// 				<div className="px-4 pb-3">
// 					{isSelf && (
// 						<Link to="/settings/profile" search>
// 							<Button>
// 								<Pencil />
// 								编辑个人资料
// 							</Button>
// 						</Link>
// 					)}
// 					{!isSelf && !isFriend && (
// 						<Button>
// 							<UserRoundPlus />
// 							添加好友
// 						</Button>
// 					)}
// 					{/* {isFriend && <UserMore  name={name} />} */}
// 					{/* <FollowButton followType={user.type} id={user.id} /> */}
// 				</div>
// 				{user?.summary && (
// 					<div data-slot="bio" className="px-4">
// 						<p className="text-sm text-secondary-foreground whitespace-pre-wrap wrap-break-word">
// 							{user?.summary}
// 						</p>
// 					</div>
// 				)}
// 			</div>
// 			<Tabs defaultValue="projects" className="w-full">
// 				<TabsList variant="line">
// 					<TabsTrigger value="projects">
// 						项目{' '}
// 						{userProjectsStats?.total && (
// 							<Badge>{userProjectsStats.total}</Badge>
// 						)}
// 					</TabsTrigger>
// 					{!isSelf && (
// 						<TabsTrigger value="teams">
// 							{teams ? `${teams.length}个` : '无'} 共同团队
// 						</TabsTrigger>
// 					)}

// 					{/* <TabsTrigger value="activity">动态</TabsTrigger>
// 					<TabsTrigger value="friends">好友</TabsTrigger> */}
// 				</TabsList>
// 				<TabsContent value="projects">
// 					<UserProjectList id={id} projects={projects} />
// 				</TabsContent>
// 				<TabsContent value="teams">
// 					{teams?.map((team) => (
// 						<TeamItemUI
// 							key={team.id}
// 							team={team}
// 							onClick={() => openTeamModal(team.id)}
// 						/>
// 					))}
// 				</TabsContent>
// 			</Tabs>
// 			{/* <div className="w-full">UserModal</div> */}
// 		</div>
// 	);
// };
