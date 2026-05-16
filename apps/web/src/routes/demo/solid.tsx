import { InputGroupInput } from '@repo/ui/base/input-group';
import { InputField } from '@repo/ui/form/text/InputField';
import { useAppForm } from '@repo/ui/form/useAppForm';
import { createForm } from '@tanstack/solid-form';
import { createFileRoute } from '@tanstack/solid-router';
import { createSignal } from 'solid-js';
import { z } from 'zod';

export const Route = createFileRoute('/demo/solid')({
	component: RouteComponent,
});

function RouteComponent() {
	const [value, setValue] = createSignal('');
	const formSchema = z.object({
		name: z.string().min(13),
	});
	const form = createForm(() => ({
		defaultValues: {
			name: '',
		},
		validators: {
			onChange: formSchema,
		},
		onSubmit: async ({ value }) => {
			// Do something with form data
			console.log(value);
		},
	}));
	const form1 = useAppForm(() => ({
		defaultValues: {
			name: '',
		},
		validators: {
			onChange: formSchema,
		},
		onSubmit: async ({ value }) => {
			// Do something with form data
			console.log(value);
		},
	}));
	return (
		<div>
			<input value={value()} onInput={(e) => setValue(e.currentTarget.value)} />
			<p>Value: {value()}</p>
			<form.Field name="name">
				{(field) => (
					<>
						<label for={field().name}>name:</label>
						<input
							id={field().name}
							name={field().name}
							value={field().state.value}
							onInput={(e) => field().handleChange(e.target.value)}
						/>
						{!field().state.meta.isValid ? (
							<em role="alert">
								{field()
									.state.meta.errors.map((i) => i?.message)
									.join(', ')}
							</em>
						) : null}
					</>
				)}
			</form.Field>
			<form1.AppForm>
				<form1.Form class="grid gap-4">
					<form1.AppField name="name">
						{(field) => (
							<>
								<label for={field().name}>name1:</label>
								<field.InputField
								// id={field().name}
								// name={field().name}
								// value={field().state.value}
								// onChange={(e) => field().handleChange(e.target.value)}
								// onInput={(e) => field().handleChange(e.target.value)}
								/>
								{!field().state.meta.isValid ? (
									<em role="alert">
										{field()
											.state.meta.errors.map((i) => i?.message)
											.join(', ')}
									</em>
								) : null}
							</>
						)}
					</form1.AppField>
				</form1.Form>
			</form1.AppForm>
		</div>
	);
}
