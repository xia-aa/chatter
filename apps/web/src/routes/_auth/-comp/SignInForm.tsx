import { m } from '@repo/shared/i18n/paraglide/messages';
import { useAppForm } from '@repo/ui/form/useAppForm';
import { z } from 'zod';
import { authClient } from '#/lib/auth/auth-client.ts';

const formSchema = z.object({
	email: z.email(),
	password: z.string().min(8),
});

export const SignInForm = (p: { onSuccess?: () => any }) => {
	const form = useAppForm(() => ({
		formId: 'SignInForm',
		defaultValues: {
			email: '',
			password: '',
		} as z.input<typeof formSchema>,
		validators: {
			onChange: formSchema,
		},
		onSubmit: async ({ value }) => {
			const result = await authClient.signIn.email(value);
			if (result.error)
				throw new Error(result.error.message || 'Sign in failed');
			p.onSuccess?.();
		},
	}));
	return (
		<form.AppForm>
			<form.Form class="grid gap-4">
				<form.AppField
					name="email"
					children={(field) => (
						<field.InputField
							title="Email"
							required
							type="email"
							class="h-9 rounded-none"
						/>
					)}
				/>
				<form.AppField
					name="password"
					children={(field) => (
						<field.PasswordField
							title="Password"
							required
							class="h-9 rounded-none"
						/>
					)}
				/>
				<form.SubmitButton label={m.signin()} class="rounded-none mt-1" />
			</form.Form>
		</form.AppForm>
	);
};
