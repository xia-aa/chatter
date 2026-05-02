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
import { RadioGroup, RadioGroupItem } from '#/components/ui/radio-group';

import { type RadioGroupVariants, radioVariants } from '#/css';
import { FormFieldTitle } from '../comp';
import { useFieldContext } from '../form';
import type { Options } from '../types';

export const FieldRadioGroup = <T extends Options>({
	title,
	required,
	options,
	defaultValue,
	children,
	variant,
	size,
	type,
	orientation,
}: {
	title?: string;
	required?: boolean;
	options: T;
	defaultValue?: string;
	children?: React.ReactNode;
	className?: string;
} & RadioGroupVariants) => {
	const field = useFieldContext<string | undefined>();
	const invalid = !field.state.meta.isValid && field.state.meta.isTouched;
	const classNames = radioVariants({
		variant,
		size,
		type,
		orientation,
	});
	return (
		<FieldSet>
			<FormFieldTitle title={title} required={required} />
			<RadioGroup
				name={field.name}
				defaultValue={defaultValue}
				value={field.state.value}
				onValueChange={(value) => field.handleChange(value)}
				className={classNames.base()}
			>
				{options.map((item) => {
					const value = typeof item === 'string' ? item : item?.value;
					const label = typeof item === 'string' ? item : item?.label || value;
					const description =
						typeof item === 'string' ? undefined : item?.description;
					return (
						<FieldLabel key={value} className={classNames.item()}>
							<FieldContent className="flex-none w-fit">
								<FieldTitle>{label || value}</FieldTitle>
								{description && (
									<FieldDescription className="text-foreground">
										{description}
									</FieldDescription>
								)}
							</FieldContent>
							<RadioGroupItem
								value={value}
								aria-invalid={invalid}
								className="sr-only hidden"
							/>
						</FieldLabel>
					);
				})}
				{/* {children} */}
			</RadioGroup>
		</FieldSet>
	);
};
