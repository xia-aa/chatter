import { FileIcon, XIcon } from 'lucide-react';
import { FieldLabel } from '#/components/ui/field';
import { isImage } from '#/lib/upload/upload.const';
import { UxTooltip } from '../tooltip';

export const Required = ({ required }: { required?: boolean }) => {
	return required ? <span className="text-red-400">*</span> : '';
};

export type FormFieldTitleProps = {
	title?: string;
	required?: boolean;
	fieldId?: string;
};
export const FormFieldTitle = ({
	title,
	required = false,
	fieldId,
}: FormFieldTitleProps) =>
	title ? (
		<FieldLabel htmlFor={fieldId}>
			{title} <Required required={required} />
		</FieldLabel>
	) : null;

export const FileGridItem = ({
	url,
	file,
	removeValue,
	disabled,
	className = '',
}: {
	url?: string;
	file?: File;
	removeValue: () => void;
	disabled?: boolean;
	className?: string;
}) => {
	const fileUrl = file ? URL.createObjectURL(file) : (url as string);
	const name = file?.name || url?.split('/').pop() || 'unknown';
	return (
		<span
			className={`group bg-muted/50 rounded-md inline-flex flex-col items-center justify-center m-1 p-1 relative ${className}`}
			title={name}
		>
			<UxTooltip content={name}>
				{isImage({ file, url }) ? (
					<img
						src={fileUrl}
						width={48}
						height={48}
						alt={name}
						className={'rounded object-cover size-12 flex'}
					/>
				) : (
					<FileIcon className="size-12 text-primary" />
				)}
			</UxTooltip>
			<button
				type="button"
				onClick={(e) => {
					console.log('FileGridItem:removeValue');
					e.stopPropagation();
					if (file && fileUrl) URL.revokeObjectURL(fileUrl);
					removeValue();
				}}
				disabled={disabled}
				className="absolute top-0 right-0 p-1 hover:bg-destructive/10 rounded-full transition disabled:opacity-50 hidden group-hover:block"
			>
				<XIcon className="w-4 h-4 text-destructive" />
			</button>
		</span>
	);
};
