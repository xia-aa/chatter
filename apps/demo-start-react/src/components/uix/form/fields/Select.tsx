import type { ReactNode } from 'react';
import { Field, FieldDescription, FieldError } from '#/components/ui/field';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '#/components/ui/select';
import { FormFieldTitle } from '#/components/uix/form/comp';
import { useFieldContext } from '#/components/uix/form/form';
import type { FieldBase, Options } from '#/components/uix/form/types';

export const FieldSelect = <T extends Options>({
	options,
	title,
	required,
	invalid,
	errors,
	description,
	placeholder,
	...props
}: FieldBase &
	React.ComponentProps<typeof Select> & {
		placeholder?: ReactNode;
		options: T;
	}) => {
	return (
		<Field orientation="responsive" data-invalid={invalid}>
			<FormFieldTitle title={title} required={required} />
			{/* <FieldContent>
      </FieldContent> */}

			<Select {...props}>
				<SelectTrigger aria-invalid={invalid} className="">
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent position="item-aligned">
					{options.map((item) => {
						const value = typeof item === 'string' ? item : item?.value;
						const label = typeof item === 'string' ? item : item?.label;

						return (
							<SelectItem key={value} value={value}>
								{label ?? value}
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>
			{description && <FieldDescription>{description}</FieldDescription>}
			{invalid && <FieldError errors={errors} />}
		</Field>
	);
};

export const SelectFieldComponents = {
	FieldSelect: <T extends Options>(props: {
		title?: string;
		description?: string;
		required?: boolean;
		placeholder?: ReactNode;
		options: T;
	}) => {
		const field = useFieldContext<string | undefined>();
		const invalid = !field.state.meta.isValid && field.state.meta.isTouched;
		return (
			<FieldSelect
				{...props}
				name={field.name}
				value={field.state.value ?? 'null'}
				onValueChange={(value) =>
					field.handleChange(value === 'null' ? undefined : value)
				}
				invalid={invalid}
				errors={field.state.meta.errors}
			/>
		);
	}, // 单选, 可选 通过 '' -> undefined | null
};
