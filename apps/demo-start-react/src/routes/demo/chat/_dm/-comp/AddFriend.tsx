import {
	createLiveQueryCollection,
	ilike,
	or,
	useLiveInfiniteQuery,
	useLiveQuery,
} from '@tanstack/react-db';
import { useStore } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import { SearchIcon, UserRoundPlus } from 'lucide-react';
import { ButtonX } from '#/components/uix/button/index.tsx';
import { useAppForm } from '#/components/uix/form/useAppForm.tsx';
import { UxAvatar, XAvatar } from '#/components/uix/img/avatar.tsx';
import { AddFriendButton } from '#/features/friend/ui/AddFriendButton.tsx';
import { UserCardPopover } from '#/features/user/ui/UserCard.tsx';
import {
	type UserRow,
	userCollect,
	userQuery,
} from '#/features/user/user.collect.ts';
import { authOptions } from '#/lib/auth.query.ts';

export function AddFriend() {
	const { data: session } = useQuery(authOptions.session);
	const form = useAppForm({
		defaultValues: {
			keyword: '',
		},
		listeners: {
			onChangeDebounceMs: 500,
		},
	});
	const keyword = useStore(form.store, (s) => s.values.keyword);
	const { data, isLoading, isEnabled, status } = useLiveQuery(
		(q) => {
			if (!keyword) return undefined;
			return userQuery.search(keyword);
		},
		[keyword],
	);
	console.log(data);
	return (
		<div className="px-3">
			<form.AppField
				name="keyword"
				children={(field) => (
					<field.FieldInputGroup AddonInlineEnd={<SearchIcon />} />
				)}
			/>
			{data && <SearchUserResults data={data} />}
		</div>
	);
}
function SearchUserResults({ data }: { data: UserRow[] }) {
	return data.map((item) => (
		<div
			key={item.id}
			className="flex gap-2 hover:bg-input rounded-md h-15 pl-2 pr-3 "
		>
			<div className="border-t flex size-full items-center justify-between">
				<UserCardPopover
					id={item.id}
					key={item.id}
					asChild
					// className="flex gap-2 hover:bg-input rounded-md h-15 pl-2 pr-3"
				>
					<div className="flex gap-2 ">
						<UxAvatar
							src={item.image}
							name={item.displayUsername || item.username}
						/>
						<div className="h-9 min-w-0 flex flex-col justify-end items-start gap-0.5 ">
							<span className="h-4.5 min-w-0 text-sm relative top-[2.4px] block flex-1 shrink w-full truncate ">
								{item.displayUsername || item.name || item.username}
							</span>
							<p className="h-4 text-xs text-muted-foreground flex items-end">
								<span className="text-[10px] text-end">{item.username}</span>
							</p>
						</div>
					</div>
				</UserCardPopover>
				<div className="flex gap-2">
					<AddFriendButton id={item.id}>
						<ButtonX
							variant="icon"
							size={'icon-lg'}
							className="bg-card! hover:text-green-400"
							Icon={<UserRoundPlus className="size-5" />}
							tip={'添加好友'}
							onClick={(e) => e.stopPropagation()}
						/>
					</AddFriendButton>
				</div>
			</div>
		</div>
	));
}
