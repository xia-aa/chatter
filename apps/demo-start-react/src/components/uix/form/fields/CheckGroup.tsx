import type { ComponentProps } from 'react';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
} from '#/components/ui/field';
import { FormFieldTitle } from '#/components/uix/form/comp';
import {
	CheckboxItem,
	type CheckboxItemProps,
	ItemFieldCheckbox,
	type ItemFieldCheckboxProps,
} from '#/components/uix/form/fields/comp';
import { useFieldContext } from '#/components/uix/form/form';
import type { FieldBase, Options } from '#/components/uix/form/types';
import { cn } from '#/lib/utils';

export const FieldCheckboxGroup = <T extends Options>({
	title,
	required,
	invalid,
	errors,
	description,
	options,
	children,
	groupClassName,
	...props
}: FieldBase &
	Omit<ItemFieldCheckboxProps, 'item'> & {
		options: T;
		children?: React.ReactNode;
		groupClassName?: string;
	}) => {
	return (
		<Field className="w-full">
			<FormFieldTitle title={title} required={required} />

			<FieldGroup className={cn('flex-row flex-wrap gap-2', groupClassName)}>
				{options.map((item) => {
					const itemValue = typeof item === 'string' ? item : item.value;
					return <ItemFieldCheckbox {...props} key={itemValue} item={item} />;
				})}
				{children}
			</FieldGroup>
			{description && <FieldDescription>{description}</FieldDescription>}
			{invalid && <FieldError errors={errors} />}
		</Field>
	);
};

export const CheckGroupFieldComponents = {
	FieldCheckboxGroup: (
		props: Omit<ComponentProps<typeof FieldCheckboxGroup>, 'value'>,
	) => {
		const field = useFieldContext<string[] | undefined>();
		const invalid = !field.state.meta.isValid && field.state.meta.isTouched;
		return (
			<FieldCheckboxGroup
				{...props}
				value={field.state.value}
				pushValue={field.pushValue}
				removeValue={field.removeValue}
				name={field.name}
				// onBlur={field.handleBlur}
				invalid={invalid}
				errors={field.state.meta.errors}
				fieldId={`${field.form.formId}-${field.name}`}
			/>
		);
	}, // 多选 [0,n]
};
