import type { VariantProps } from 'class-variance-authority';
import { ToggleGroup } from 'radix-ui';
import type React from 'react';
import { Checkbox } from '#/components/ui/checkbox';
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
	FieldTitle,
	type fieldVariants,
} from '#/components/ui/field';
import { Switch } from '#/components/ui/switch';

import { CheckGroupFieldComponents } from '#/components/uix/form/fields/CheckGroup';
import {
	CheckboxItem,
	type CheckboxItemProps,
} from '#/components/uix/form/fields/comp';
import { FileFieldComponents } from '#/components/uix/form/fields/FileInput';
import { InputFieldComponents } from '#/components/uix/form/fields/Input';
import { SelectFieldComponents } from '#/components/uix/form/fields/Select';
import { type RadioGroupVariants, radioVariants } from '#/css';
import { cn } from '#/lib/utils';
import { FormFieldTitle, type FormFieldTitleProps, Required } from './comp';
import { FieldRadioGroup } from './fields/FieldRadioGroup';
import { InputGroupFieldComponents } from './fields/InputGroup';
import { useFieldContext } from './form';
import type { CompFieldProps, FieldBase, Options } from './types';

export const FieldSwitch = ({
	title,
	description,
}: {
	title?: string;
	description?: string;
}) => {
	const field = useFieldContext<boolean>();
	const invalid = !field.state.meta.isValid && field.state.meta.isTouched;
	return (
		<Field orientation="horizontal" data-invalid={invalid}>
			{title ||
				(description && (
					<FieldContent>
						<FieldLabel>{title}</FieldLabel>
						<FieldDescription>{description}</FieldDescription>
					</FieldContent>
				))}

			<Switch
				name={field.name}
				checked={field.state.value}
				onCheckedChange={field.handleChange}
				aria-invalid={invalid}
				className="mr-0.5"
			/>
		</Field>
	);
};

const FieldCheckbox = ({
	label,
	description,
}: {
	label?: React.ReactNode;
	description?: string;
}) => {
	const field = useFieldContext<boolean | undefined>();
	const invalid = !field.state.meta.isValid && field.state.meta.isTouched;
	return (
		<Field data-invalid={invalid}>
			<div className="flex  gap-2 text-muted-foreground text-xs ">
				<Checkbox
					name={field.name}
					id={`checkbox-${field.name}`}
					aria-invalid={invalid}
					checked={field.state.value}
					onCheckedChange={(checked) => field.handleChange(checked as boolean)}
				/>
				<FieldContent>
					<FieldLabel className="text-xs" htmlFor={`checkbox-${field.name}`}>
						{label}
					</FieldLabel>
					{description && <FieldDescription>{description}</FieldDescription>}
				</FieldContent>
			</div>
			{invalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
};
const FieldCheck = ({ label }: { label: string }) => {
	const field = useFieldContext<boolean | undefined>();
	const invalid = !field.state.meta.isValid && field.state.meta.isTouched;
	return (
		<FieldLabel className={radioVariants({ size: 'sm' }).item()}>
			<Checkbox
				name={field.name}
				aria-invalid={invalid}
				checked={field.state.value}
				onCheckedChange={(checked) => {
					if (checked) {
						field.handleChange(checked as boolean);
						return;
					}
					field.handleChange(undefined);
				}}
				className="sr-only  w-0 hidden"
			/>
			{label}
		</FieldLabel>
	);
};

export const FieldToggleGroup = <T extends Options>({
	title,
	required,
	options,
	defaultValue,
	variant,
	size,
	type,
	orientation,
	...props
}: FieldBase &
	RadioGroupVariants & {
		options: T;
		defaultValue?: string;
		value?: string;
		onValueChange?: (value: string) => void;
	}) => {
	const classNames = radioVariants({
		variant,
		size,
		type,
		orientation,
	});
	return (
		<Field>
			<FormFieldTitle title={title} required={required} />
			<ToggleGroup.Root
				{...props}
				type="single"
				defaultValue={defaultValue}
				className={classNames.base()}
			>
				{options.map((item) => {
					const value = typeof item === 'string' ? item : item?.value;
					const label = typeof item === 'string' ? item : item?.label || value;
					const description =
						typeof item === 'string' ? undefined : item?.description;
					return (
						<ToggleGroup.Item
							key={value}
							value={value}
							className={classNames.item()}
						>
							<FieldTitle>{label}</FieldTitle>
							{description && (
								<FieldDescription className="text-foreground">
									{description}
								</FieldDescription>
							)}
						</ToggleGroup.Item>
					);
				})}
			</ToggleGroup.Root>
		</Field>
	);
};
export const fieldComponents = {
	FieldCheckbox,

	...FileFieldComponents,

	...InputFieldComponents,
	...InputGroupFieldComponents,

	FieldSwitch, // bool
	...SelectFieldComponents,

	FieldRadioGroup,
	FieldToggleGroup: <T extends Options>({
		title,
		required,
		options,
		defaultValue,
		variant,
		size,
		type,
		orientation,
	}: FieldBase & {
		options: T;
		defaultValue?: string;
	} & RadioGroupVariants) => {
		const field = useFieldContext<string | undefined>();
		// const invalid = !field.state.meta.isValid && field.state.meta.isTouched;
		const classNames = radioVariants({
			variant,
			size,
			type,
			orientation,
		});
		return (
			<Field>
				<FormFieldTitle title={title} required={required} />
				<ToggleGroup.Root
					type="single"
					defaultValue={defaultValue}
					value={field.state.value}
					onValueChange={(value) => field.handleChange(value)}
					className={classNames.base()}
				>
					{options.map((item) => {
						const value = typeof item === 'string' ? item : item?.value;
						const label =
							typeof item === 'string' ? item : item?.label || value;
						const description =
							typeof item === 'string' ? undefined : item?.description;
						return (
							<ToggleGroup.Item
								key={value}
								value={value}
								className={classNames.item()}
							>
								<FieldTitle>{label}</FieldTitle>
								{description && (
									<FieldDescription className="text-foreground">
										{description}
									</FieldDescription>
								)}
							</ToggleGroup.Item>
						);
					})}
				</ToggleGroup.Root>
			</Field>
		);
	},

	...CheckGroupFieldComponents,
	FieldCheck,
};
