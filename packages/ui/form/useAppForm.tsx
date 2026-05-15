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

export const { useAppForm } = createFormHook({
	fieldContext,
	formContext,
	// We'll learn more about these options later
	fieldComponents: {

	},
	formComponents: {
		NextButton,
		SubmitButton,
		Form,
		FormFloatingSaveBar,
		SyncToLocalStorage,
	},
});
