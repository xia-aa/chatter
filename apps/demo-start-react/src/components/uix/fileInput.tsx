import { UploadIcon } from 'lucide-react';
import { type ChangeEvent, useRef, useState } from 'react';
import type {
	FieldFileChange,
	FieldFileItem,
} from '#/lib/upload/upload.schema';
import { cn } from '#/lib/utils';
import { FieldError } from '../ui/field';
import { FileGridItem } from './form/comp';
import type { CompFieldProps } from './form/types';

export type XFileInputProps = Omit<
	React.ComponentProps<'input'>,
	'value' | 'onChange'
> &
	CompFieldProps & {
		value?: FieldFileItem[];
		onChange?: (files: FieldFileItem[]) => void;
		// 变体: 虚线, 实心的
		variant?: 'dashed' | 'solid';
		orientation?: 'horizontal' | 'vertical';
		showPreview?: boolean;
		removeValue?: (index: number) => void;
	};
export const XFileInput = ({
	value = [],
	onChange,
	multiple = true,
	accept = 'image/*',
	disabled = false,
	description = '上传文件',
	variant = 'solid',
	className,
	orientation = 'vertical',
	invalid,
	errors,
	showPreview = true,
	removeValue,
	...props
}: XFileInputProps) => {
	console.log('XFileInput:', value);
	const inputRef = useRef<HTMLInputElement>(null); // 2. 创建 Ref
	const [isDragging, setDragging] = useState(false);
	const handleValueChange = (incoming: File[]) => {
		const newItems: FieldFileChange[] = incoming.map((f) => ({
			url: URL.createObjectURL(f),
			file: f, // 挂载原始文件供之后上传使用
		}));
		const updated = multiple ? [...value, ...newItems] : newItems;
		onChange?.(updated);
	};
	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragging(false);
		if (!disabled) handleValueChange(Array.from(e.dataTransfer.files));
	};
	const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
		handleValueChange(Array.from(e.target.files || []));
	const showSinglePreview = showPreview && !multiple && value.length > 0;
	return (
		<div
			className={cn(
				'flex flex-col gap-2',
				orientation === 'horizontal' && 'flex-row',
			)}
		>
			<div
				data-variant={variant}
				className={cn(
					'group data-[variant=solid]:bg-input data-[variant=dashed]:border-dashed data-[variant=dashed]:border-border data-[variant=dashed]:border-2 data-[variant=dashed]:hover:border-primary/50 hover:bg-secondary/30 relative rounded-lg transition-all h-45 flex items-center justify-center',
					'',
					isDragging && 'data-[variant=dashed]:border-primary bg-primary/5',
					className,
				)}
			>
				<input
					{...props}
					ref={inputRef}
					type="file"
					className="opacity-0 absolute inset-0 size-full cursor-pointer disabled:cursor-not-allowed"
					multiple={multiple}
					accept={accept}
					disabled={disabled}
					onChange={onChange ? handleChange : undefined}
					onDrop={handleDrop}
					onDragOver={(e) => e.preventDefault()}
					onDragEnter={() => setDragging(true)}
					onDragLeave={() => setDragging(false)}
				/>

				{showSinglePreview ? (
					<FileGridItem
						file={value[0]?.file}
						url={value[0]?.url}
						removeValue={() => {
							removeValue?.(0);
							if (inputRef.current) {
								inputRef.current.value = '';
							}
						}}
						className="absolute size-full m-0! "
					/>
				) : (
					<div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
						<UploadIcon
							className={cn(
								'w-6 h-6 text-muted-foreground transition group-hover:text-accent-foreground',
								isDragging && 'text-primary w-8 h-8',
							)}
						/>
						<p
							className={cn(
								'text-sm text-muted-foreground group-hover:text-accent-foreground',
								isDragging && 'text-primary',
							)}
						>
							{description}
						</p>
					</div>
				)}
			</div>
			{invalid && <FieldError errors={errors} />}
			{showPreview && multiple && (
				<div className="flex">
					{value?.map((item, index) => (
						<FileGridItem
							key={item.url}
							file={item.file}
							url={item.url}
							removeValue={() => removeValue?.(index)}
						/>
					))}
				</div>
			)}
		</div>
	);
};
