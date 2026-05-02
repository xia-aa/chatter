import { Eye, EyeOff, LockKeyhole, Search } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Field, FieldDescription, FieldError } from '#/components/ui/field';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupTextarea,
} from '#/components/ui/input-group';
import { useFieldContext } from '#/components/uix/form/form';
import { FormFieldTitle } from '../comp';
import type { FieldBase } from '../types';

// 定义一个通用的长度计算逻辑
const getSafeLength = (val: any): number => {
	if (Array.isArray(val)) return val.length; // 数组返回元素个数
	if (val === undefined || val === null) return 0;
	return String(val).length; // 字符串或数字返回字符数
};

type FieldInputProps = FieldBase & React.ComponentProps<'input'>;
export const FieldInput = ({
	title,
	required,
	fieldId,
	invalid,
	errors,
	description,
	maxLength,
	...props
}: FieldInputProps) => {
	return (
		<Field data-invalid={invalid}>
			<FormFieldTitle title={title} required={required} fieldId={fieldId} />
			{/* <Input {...props} id={fieldId} aria-invalid={invalid} /> */}
			<InputGroup>
				<InputGroupInput
					{...props}
					maxLength={maxLength}
					id={fieldId}
					aria-invalid={invalid}
				/>
				{maxLength && (
					<InputGroupAddon align="inline-end">
						{getSafeLength(props.value)}/{maxLength}
					</InputGroupAddon>
				)}
			</InputGroup>
			{description && <FieldDescription>{description}</FieldDescription>}
			{invalid && <FieldError errors={errors} />}
		</Field>
	);
};

type FieldTextarea = FieldBase & React.ComponentProps<'textarea'>;
export const FieldTextarea = ({
	invalid,
	title,
	description,
	required = false,
	fieldId,
	errors,
	...props
}: FieldTextarea) => {
	return (
		<Field data-invalid={invalid}>
			<FormFieldTitle title={title} required={required} fieldId={fieldId} />
			<InputGroup className={props.className}>
				{/* <Textarea {...props} id={fieldId} aria-invalid={invalid} /> */}
				<InputGroupTextarea {...props} id={fieldId} aria-invalid={invalid} />
				{props.maxLength && (
					<InputGroupAddon align="block-end">
						{getSafeLength(props.value)}/{props.maxLength}
					</InputGroupAddon>
				)}
			</InputGroup>
			{description && <FieldDescription>{description}</FieldDescription>}
			{invalid && <FieldError errors={errors} />}
		</Field>
	);
};

export type FieldInputGroupProps = FieldBase &
	React.ComponentProps<'input'> & {
		Addon?: React.ReactNode;
		AddonInlineEnd?: React.ReactNode;
	};
export const FieldInputGroup = ({
	title,
	description,
	required,
	fieldId,
	invalid,
	errors,
	Addon,
	AddonInlineEnd,
	...props
}: FieldInputGroupProps) => {
	return (
		<Field data-invalid={invalid}>
			<FormFieldTitle title={title} required={required} fieldId={fieldId} />
			<InputGroup>
				<InputGroupInput {...props} id={fieldId} aria-invalid={invalid} />
				{Addon && <InputGroupAddon>{Addon}</InputGroupAddon>}
				{AddonInlineEnd && (
					<InputGroupAddon align="inline-end">{AddonInlineEnd}</InputGroupAddon>
				)}
			</InputGroup>
			{description && <FieldDescription>{description}</FieldDescription>}
			{invalid && <FieldError errors={errors} />}
		</Field>
	);
};
const InputPassword = ({
	title,
	placeholder = '请输入密码',
	description,
	required = true,
}: {
	title?: string;
	placeholder?: string;
	description?: string;
	required?: boolean;
}) => {
	const field = useFieldContext<string>();
	const invalid = !field.state.meta.isValid && field.state.meta.isTouched;
	const [isVisible, setIsVisible] = useState(false);
	return (
		<Field data-invalid={invalid}>
			<FormFieldTitle title={title} required={required} />
			<InputGroup>
				<InputGroupInput
					placeholder={placeholder}
					value={field.state.value}
					onChange={(e) => field.handleChange(e.target.value)}
					type={isVisible ? 'text' : 'password'}
				/>
				<InputGroupAddon>
					<LockKeyhole />
				</InputGroupAddon>
				<InputGroupAddon align="inline-end">
					<button
						aria-label="toggle password visibility"
						className="focus:outline-hidden mr-1"
						type="button"
						onClick={() => setIsVisible(!isVisible)}
					>
						{isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
					</button>
				</InputGroupAddon>
			</InputGroup>
			{description && <FieldDescription>{description}</FieldDescription>}
			{invalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
};
export const InputGroupFieldComponents = {
	FieldInput: (props: Omit<FieldInputProps, 'fieldId'>) => {
		const field = useFieldContext<string | undefined>();
		const invalid = !field.state.meta.isValid && field.state.meta.isTouched;
		return (
			<FieldInput
				{...props}
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				invalid={invalid}
				errors={field.state.meta.errors}
			/>
		);
	},
	FieldNumberInput: (props: {
		title?: string;
		description?: string;
		required?: boolean;
		placeholder?: string;
	}) => {
		const field = useFieldContext<number | undefined>();
		const invalid = !field.state.meta.isValid && field.state.meta.isTouched;
		return (
			<FieldInput
				{...props}
				type="number"
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) =>
					field.handleChange(
						e.target.value === '' ? undefined : Number(e.target.value),
					)
				}
				invalid={invalid}
				errors={field.state.meta.errors}
			/>
		);
	},
	FieldInputGroup: (props: Omit<FieldInputGroupProps, 'fieldId'>) => {
		const field = useFieldContext<string>();
		const invalid = !field.state.meta.isValid && field.state.meta.isTouched;
		return (
			<FieldInputGroup
				{...props}
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				invalid={invalid}
				errors={field.state.meta.errors}
				fieldId={`${field.form.formId}_${field.name}`}
			/>
		);
	},
	InputPassword,
	FieldTextarea: (props: FieldTextarea) => {
		const field = useFieldContext<string>();
		const invalid = !field.state.meta.isValid && field.state.meta.isTouched;
		return (
			<FieldTextarea
				{...props}
				name={field.name}
				value={field.state.value || ''}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				invalid={invalid}
				errors={field.state.meta.errors}
				fieldId={`${field.form.formId}_${field.name}`}
			/>
		);
	},
	FieldSearch: ({ className }: { className?: string }) => {
		const field = useFieldContext<string>();
		return (
			<InputGroup className={`w-fit ${className}`}>
				<InputGroupInput
					placeholder="搜索..."
					value={field.state.value}
					onChange={(e) => field.handleChange(e.target.value)}
				/>
				<InputGroupAddon>
					<Search />
				</InputGroupAddon>
			</InputGroup>
		);
	},
};
