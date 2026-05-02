import type { ComponentProps } from 'react';
import {
	AutocompleteEmpty,
	AutocompleteInput,
	AutocompleteItem,
	AutocompleteList,
	AutocompletePopup,
	AutocompleteRoot,
} from '#/components/ui/autocomplete';
import { Field, FieldDescription, FieldError } from '#/components/ui/field';
import { useFieldContext } from '#/components/uix/form/form';
import {
	InputList,
	type InputListProps,
} from '#/components/uix/form/InputList';
import { FormFieldTitle } from '../comp';
import type { FieldBase } from '../types';

export const FieldAutocomplete = ({
	fieldId,
	invalid,
	errors,
	title,
	description,
	required = false,
	placeholder,
	// items,
	openOnInputClick = true,
	emptyText = '没有找到, 可以输入自定义内容',
	onBlur,
	...props
}: FieldBase &
	ComponentProps<typeof AutocompleteInput> &
	ComponentProps<typeof AutocompleteRoot> & {
		emptyText?: string;
	}) => {
	return (
		<Field data-invalid={invalid}>
			<FormFieldTitle title={title} required={required} fieldId={fieldId} />
			<AutocompleteRoot {...props} openOnInputClick={openOnInputClick}>
				<AutocompleteInput
					id={fieldId}
					aria-invalid={invalid}
					onBlur={onBlur}
					placeholder={placeholder}
				/>
				<AutocompletePopup>
					{emptyText && <AutocompleteEmpty>{emptyText}</AutocompleteEmpty>}
					<AutocompleteList>
						{(item) => (
							<AutocompleteItem key={item.value} value={item}>
								{item.label || item.value}
							</AutocompleteItem>
						)}
					</AutocompleteList>
				</AutocompletePopup>
			</AutocompleteRoot>
			{description && <FieldDescription>{description}</FieldDescription>}
			{invalid && <FieldError errors={errors} />}
		</Field>
	);
};

export const FieldInputList = ({
	title,
	required,
	fieldId,
	invalid,
	errors,
	description,
	...props
}: FieldBase & InputListProps) => {
	return (
		<Field data-invalid={invalid}>
			<FormFieldTitle title={title} required={required} fieldId={fieldId} />
			<InputList {...props} id={fieldId} aria-invalid={invalid} />
			{description && <FieldDescription>{description}</FieldDescription>}
			{invalid && <FieldError errors={errors} />}
		</Field>
	);
};

export const InputFieldComponents = {
	FieldAutocomplete: (props: ComponentProps<typeof FieldAutocomplete>) => {
		const field = useFieldContext<string | number | undefined>();
		const invalid = !field.state.meta.isValid && field.state.meta.isTouched;
		return (
			<FieldAutocomplete
				{...props}
				name={field.name}
				value={field.state.value}
				onValueChange={field.handleChange}
				onBlur={field.handleBlur}
				invalid={invalid}
				errors={field.state.meta.errors}
				fieldId={`${field.form.formId}-${field.name}`}
			/>
		);
	},
	FieldInputList: (
		props: Omit<
			React.ComponentProps<typeof FieldInputList>,
			'onChange' | 'value'
		>,
	) => {
		const field = useFieldContext<string[] | undefined>();
		const invalid = !field.state.meta.isValid && field.state.meta.isTouched;
		return (
			<FieldInputList
				{...props}
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={field.handleChange}
				invalid={invalid}
				errors={field.state.meta.errors}
			/>
		);
	},
};
