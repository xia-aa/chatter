import { createFormHook } from '@tanstack/solid-form';
import type { VariantProps } from 'class-variance-authority';

import {
	Form,
	FormFloatingSaveBar,
	fieldContext,
	formContext,
	NextButton,
	SubmitButton,
	SyncToLocalStorage,
	useFieldContext,
} from './form';
import { InputField, InputFieldProps } from './text/InputField';
import { PasswordField } from './text/PasswordField';
import { createEffect, splitProps } from 'solid-js';

export const { useAppForm } = createFormHook({
	fieldContext,
	formContext,
	// We'll learn more about these options later
	fieldComponents: {
		InputField: (props: Omit<InputFieldProps, 'fieldId'>) => {
			 const [local, others] = splitProps(props, ['invalid',     'errors', ]);
					const field = useFieldContext<string | undefined>()
		const invalid = () => !field().state.meta.isValid && field().state.meta.isTouched;
		createEffect(() => {
			console.log('useAppForm InputField', {  errors: field().state.meta.errors, invalid: invalid() });
		});
				return (
			<InputField
				{...others}
				name={field().name}
				value={field().state.value}
				onBlur={field().handleBlur}
				onInput={(e) => field().handleChange(e.target.value)}
				invalid={invalid()}
				errors={field().state.meta.errors}
			/>
		);
		},
		PasswordField
	},
	formComponents: {
		NextButton,
		SubmitButton,
		Form,
		FormFloatingSaveBar,
		SyncToLocalStorage,
	},
});
