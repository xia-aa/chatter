import { useLiveQuery } from '@tanstack/react-db';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Check, Search, XIcon } from 'lucide-react';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from '#/components/ui/input-group';
import { ButtonX } from '#/components/uix/button';
import { ActionButton, ActionDiv } from '#/components/uix/button/button.c';
import { XAvatar } from '#/components/uix/img/avatar';
import { StatusAvatar } from '#/components/uix/img/StatusAvatar';
import { friendRequestOpt } from '#/features/friend/friend.collect.ts';
// import { useUserStatus } from '#/lib/ws/provider';

export function PendingFriendList({ meId }: { meId: string }) {
	const { data } = useLiveQuery(friendRequestOpt.list(meId));
	// const { data } = useSuspenseQuery(orpc.listFriendRequest.queryOptions())
	console.log('pending friend request', data);
	// const ids = data.map(r => r.user.id)
	// const { getUserStatus } = useUserStatus(ids)
	const receivedRequests = data.filter((r) => r.receiver_id === meId);
	const sentRequests = data.filter((r) => r.emitter_id === meId);
	// const { mutate, isPending } = useMutation(
	// 	orpc.rejectFriendRequest.mutationOptions({
	// 		onError(error, variables, onMutateResult, context) {},
	// 		onSettled: (data, error, variables, onMutateResult, context) => {
	// 			context.client.invalidateQueries(orpc.listFriendRequest.queryOptions());
	// 		},
	// 	}),
	// );
	return (
		<div className="px-3">
			{/* <InputGroup> // TODO: client
          <InputGroupInput placeholder="Search..." />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup> */}
			<div className="py-3 px-2">收到: {receivedRequests.length}</div>
			{receivedRequests.map((item) => (
				<ActionDiv
					key={item.id}
					className="flex gap-2 hover:bg-input rounded-md h-15 pl-2 pr-3 "
				>
					<div className="border-t flex size-full items-center justify-between">
						<div className="flex gap-2 ">
							<StatusAvatar
								src={item.user.image}
								name={item.user.displayUsername || item.user.username}
								// onlineStatus={getUserStatus(item.user.id)}
							/>
							<div className="h-9 min-w-0 flex flex-col justify-end items-start gap-0.5 ">
								<span className="h-4.5 min-w-0 text-sm relative top-[2.4px] block flex-1 shrink w-full truncate ">
									{item.user.displayUsername || item.user.username}
								</span>
								<p className="h-4 text-xs text-muted-foreground flex items-end">
									<span className="text-[10px] text-end">
										{item.user.displayUsername}
									</span>
								</p>
							</div>
						</div>
						<div className="flex gap-2">
							<ActionButton
								variant="icon"
								size={'icon-lg'}
								className="bg-card! hover:text-green-400"
								Icon={<Check className="size-5" />}
								onClick={async () => {
									// 模拟等待
									await new Promise((resolve) => setTimeout(resolve, 3000));
								}}
								tip={'接受'}
							/>
							<ButtonX
								variant="icon"
								size={'icon-lg'}
								className="bg-card! hover:text-red-400"
								Icon={<XIcon className="size-5" />}
								// pending={isPending}
								// onClick={() => mutate(item.id)}
								tip={'忽略'}
							/>
						</div>
					</div>
				</ActionDiv>
			))}
			<div className="py-3 px-2">发出: {sentRequests.length}</div>
			<ul></ul>
		</div>
	);
}
