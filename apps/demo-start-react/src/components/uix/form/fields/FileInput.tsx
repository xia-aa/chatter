import { Field, FieldError, FieldLabel } from '#/components/ui/field';
import { XFileInput, type XFileInputProps } from '#/components/uix/fileInput';
import { FormFieldTitle } from '#/components/uix/form/comp';
import { useFieldContext } from '#/components/uix/form/form';
import type { FieldBase } from '#/components/uix/form/types';
import type { FieldFileItem } from '#/lib/upload/upload.schema';

export type FieldXFileInputProps = FieldBase & XFileInputProps;
export const FieldXFileInput = ({
	title,
	required,
	fieldId,
	invalid,
	errors,
	showPreview = true,
	removeValue,
	value,
	...props
}: FieldXFileInputProps) => {
	return (
		<Field data-invalid={invalid}>
			<FormFieldTitle title={title} required={required} fieldId={fieldId} />
			<XFileInput
				{...props}
				value={value}
				showPreview={showPreview}
				removeValue={removeValue}
				id={fieldId}
				aria-invalid={invalid}
				invalid={invalid}
				errors={errors}
			/>
		</Field>
	);
};

export const FileFieldComponents = {
	FieldXFileInput: (
		props: Omit<FieldXFileInputProps, 'onChange' | 'value'>,
	) => {
		const field = useFieldContext<FieldFileItem[] | undefined>();
		const subErrors =
			field.state.value
				?.flatMap((_, index) => {
					// 动态获取子字段的状态，而不需要重新订阅整个 Form
					return field.form
						.getFieldMeta(`${field.name}[${index}].file`)
						?.errors.flat();
				})
				.filter(Boolean) || []; // Boolean 是构造函数, 这里用于去除假值
		const errors = [...field.state.meta.errors, ...subErrors];
		const invalid =
			(!field.state.meta.isValid || subErrors.length > 0) &&
			field.state.meta.isTouched;
		return (
			<FieldXFileInput
				{...props}
				name={field.name}
				defaultValue={[]}
				value={field.state.value}
				onChange={field.handleChange}
				removeValue={field.removeValue}
				invalid={invalid}
				errors={errors}
			/>
		);
	},
};
