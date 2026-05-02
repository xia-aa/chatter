import { XIcon } from 'lucide-react';
import { Checkbox } from '#/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '#/components/ui/field';
import { FormFieldTitle } from '#/components/uix/form/comp';
import type { Option } from '#/components/uix/form/types';
import { radioVariants } from '#/css';
import { cn } from '#/lib/utils';

export type ItemFieldCheckboxProps = {
	invalid?: boolean;
	item: Option | string;
	name?: string;
	value: string[] | undefined;
	pushValue?: (value: string) => void;
	removeValue?: (index: number) => void;
	type?: 'default' | 'x' | 'only_read';
	max?: number;
};
export const ItemFieldCheckbox = ({
	invalid = false,
	name,
	value,
	item,
	pushValue,
	removeValue,
	type = 'default',
	max,
}: ItemFieldCheckboxProps) => {
	const itemValue = typeof item === 'string' ? item : item.value;
	const itemLabel = typeof item === 'string' ? item : item.label;
	return (
		<FieldLabel
			htmlFor={`checkbox-${itemValue}`}
			className={radioVariants({ size: 'sm', type }).item()}
		>
			<Checkbox
				id={`checkbox-${itemValue}`}
				name={name}
				aria-invalid={invalid}
				checked={value?.includes(itemValue)}
				onCheckedChange={(checked) => {
					if (checked) {
						pushValue?.(itemValue);
						console.log({ max, value });
						if (max && value && value?.length >= max) {
							removeValue?.(0);
						}
					} else if (value) {
						const index = value.indexOf(itemValue);
						if (index > -1) {
							removeValue?.(index);
						}
					}
				}}
				className="sr-only w-0 hidden"
			/>
			{itemLabel || itemValue}
			{type === 'x' && <XIcon size={16} strokeWidth={2.5} />}
		</FieldLabel>
	);
};

export type CheckboxItemProps = {
	item: Option | string;
};
export const CheckboxItem = ({ item }: CheckboxItemProps) => {
	const itemValue = typeof item === 'string' ? item : item.value;
	const itemLabel = typeof item === 'string' ? item : item.label;
	return (
		<FieldLabel
			className={radioVariants({ size: 'sm', type: 'only_read' }).item()}
		>
			<Checkbox className="sr-only w-0 hidden" disabled />
			{itemLabel || itemValue}
		</FieldLabel>
	);
};

export const CheckboxGroup = ({
	value,
	className,
	title,
}: {
	value: string[] | Option[] | undefined;
	className?: string;
	title?: string;
}) => {
	return (
		<Field className="w-full">
			<FormFieldTitle title={title} />
			<FieldGroup
				className={cn(
					'flex-row flex-wrap gap-2  p-3 rounded-xl bg-input',
					className,
				)}
			>
				{value?.map((item) => {
					const itemValue = typeof item === 'string' ? item : item.value;
					return <CheckboxItem key={itemValue} item={item} />;
				})}
			</FieldGroup>
		</Field>
	);
};
