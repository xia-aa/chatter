import { debugSsr } from '@repo/shared/lib/utils/env.ts';
import { Button } from '@repo/ui/base/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@repo/ui/base/dropdown-menu.tsx';
import { useQuery } from '@tanstack/solid-query';
import { getRouteApi, Link } from '@tanstack/solid-router';
import { Show } from 'solid-js';
import { sessionQuery } from '#/lib/auth/auth.query.ts';
import { authClient } from './auth-client';

const UserAvatar = (props: { name?: string; image?: string | null }) => {
	return (
		<Show
			when={props.image}
			fallback={
				<div class="size-9 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
					<span class="text-xs font-medium text-neutral-600 dark:text-neutral-400">
						{props.name?.charAt(0).toUpperCase() || 'U'}
					</span>
				</div>
			}
		>
			{(image) => <img src={image()} alt="" class="size-9" />}
		</Show>
	);
};

export function BetterAuthHeader() {
	const session = useQuery(() => sessionQuery);
	// const session = authClient.useSession();
	// debugSsr(session.data?.user);
	return (
		<Show
			when={!session.isPending}
			fallback={
				<div class="h-8 w-8 bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
			}
		>
			<Show
				when={session.data?.user}
				fallback={
					<Link
						to="/auth"
						class="h-9 px-4 text-sm font-medium bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors inline-flex items-center"
					>
						Sign in
					</Link>
				}
			>
				{(user) => (
					<div class="flex items-center gap-2">
						<DropdownMenu>
							<DropdownMenuTrigger>
								<UserAvatar name={user().name} image={user().image} />
							</DropdownMenuTrigger>
							<DropdownMenuContent class="w-48">
								<DropdownMenuItem>
									<span>Commit</span>
									<DropdownMenuShortcut>⌘+K</DropdownMenuShortcut>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<span>Push</span>
									<DropdownMenuShortcut>⇧+⌘+K</DropdownMenuShortcut>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<span>Update Project</span>
									<DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
								</DropdownMenuItem>
								<DropdownMenuSub overlap>
									<DropdownMenuSubTrigger>GitHub</DropdownMenuSubTrigger>
									<DropdownMenuPortal>
										<DropdownMenuSubContent>
											<DropdownMenuItem>Create Pull Request…</DropdownMenuItem>
											<DropdownMenuItem>View Pull Requests</DropdownMenuItem>
											<DropdownMenuItem>Sync Fork</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem>Open on GitHub</DropdownMenuItem>
										</DropdownMenuSubContent>
									</DropdownMenuPortal>
								</DropdownMenuSub>
								{session.data?.user.role === 'admin' && (
									<>
										<DropdownMenuSeparator />
										<DropdownMenuItem>
											<Link to="/admin">Admin Dashboard</Link>
										</DropdownMenuItem>
									</>
								)}
							</DropdownMenuContent>
						</DropdownMenu>

						<button
							onClick={() => {
								void authClient.signOut();
							}}
							class="flex-1 h-9 px-4 text-sm font-medium bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
						>
							Sign out
						</button>
					</div>
				)}
			</Show>
		</Show>
	);
}
