import { m } from '@repo/shared/i18n/paraglide/messages';
import {
	Tabs,
	TabsContent,
	TabsIndicator,
	TabsList,
	TabsTrigger,
} from '@repo/ui/base/tabs';
import { useAppForm } from '@repo/ui/form/useAppForm';
import { createForm } from '@tanstack/solid-form';
import { useQuery } from '@tanstack/solid-query';
import { ClientOnly, createFileRoute } from '@tanstack/solid-router';
import { createSignal, Show } from 'solid-js';
import { z } from 'zod';
import { sessionQuery } from '#/lib/auth/auth.query.ts';
import { SignInForm } from '#/routes/_auth/-comp/SignInForm.tsx';
import { SignUpForm } from '#/routes/_auth/-comp/SignUpForm.tsx';
import { authClient } from '../../lib/auth/auth-client';

export const Route = createFileRoute('/_auth/auth')({
	component: () => (
		<ClientOnly>
			<AuthUi />
		</ClientOnly>
	),
});

function AuthUi() {
	const session = useQuery(() => sessionQuery);
	const callbackURL = Route.useSearch({ select: (s) => s.callbackURL });
	const navigate = Route.useNavigate();
	const onSuccess = () => {
		navigate({
			to: callbackURL() || '/',
		});
		session.refetch();
	};
	if (session.isPending)
		return (
			<div class="flex items-center justify-center py-10">
				<div class="h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900 dark:border-neutral-800 dark:border-t-neutral-100" />
			</div>
		);
	if (!session.data?.user)
		return (
			<div class="flex justify-center py-10 px-4">
				<div class="w-full max-w-md p-6">
					<Tabs defaultValue="signin">
						<TabsList class="mb-4">
							<TabsTrigger value="signin">{m.signin()}</TabsTrigger>
							<TabsTrigger value="signup">{m.signup()}</TabsTrigger>
							<TabsIndicator />
						</TabsList>
						<TabsContent value="signin">
							<SignInForm onSuccess={onSuccess} />
						</TabsContent>
						<TabsContent value="signup">
							<SignUpForm onSuccess={onSuccess} />
						</TabsContent>
					</Tabs>
				</div>
			</div>
		);
	return (
		<div class="flex justify-center py-10 px-4">
			<div class="w-full max-w-md p-6 space-y-6">
				<div class="space-y-1.5">
					<h1 class="text-lg font-semibold leading-none tracking-tight">
						Welcome back
					</h1>
					<p class="text-sm text-neutral-500 dark:text-neutral-400">
						You're signed in as {session.data?.user.email}
					</p>
				</div>

				<div class="flex items-center gap-3">
					<Show
						when={session.data?.user.image}
						fallback={
							<div class="h-10 w-10 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
								<span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">
									{session.data?.user.name?.charAt(0).toUpperCase() || 'U'}
								</span>
							</div>
						}
					>
						{(image) => <img src={image()} alt="" class="h-10 w-10" />}
					</Show>
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium truncate">
							{session.data?.user.name}
						</p>
						<p class="text-xs text-neutral-500 dark:text-neutral-400 truncate">
							{session.data?.user.email}
						</p>
					</div>
				</div>

				<button
					onClick={() => {
						void authClient.signOut();
					}}
					class="w-full h-9 px-4 text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
				>
					Sign out
				</button>
			</div>
		</div>
	);
}
