import { GripVertical, Plus, Trash2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';

export type InputListProps = Omit<
	React.ComponentProps<'input'>,
	'value' | 'onChange'
> & {
	value?: string[];
	onChange?: (val: string[]) => void;
};
export function InputList({
	value = [],
	onChange,
	placeholder = '输入内容...',
	...props
}: InputListProps) {
	const [pending, setPending] = useState('');

	const handleAdd = () => {
		const trimmed = pending.trim();
		if (trimmed) {
			onChange?.([...value, trimmed]);
			setPending('');
		}
	};

	const handleRemove = (index: number) => {
		onChange?.(value.filter((_, i) => i !== index));
	};

	const handleUpdate = (index: number, newVal: string) => {
		const updated = [...value];
		updated[index] = newVal;
		onChange?.(updated);
	};

	return (
		<div className="space-y-2">
			{/* 1. 已存在的列表项 */}
			{value.map((item, index) => (
				<div key={index} className="flex items-center gap-2 group">
					<Input
						value={item}
						onChange={(e) => handleUpdate(index, e.target.value)}
						className="flex-1"
					/>
					<Button
						variant="icon"
						size="icon"
						onClick={() => handleRemove(index)}
						className="hover:text-destructive"
					>
						<Trash2 className="shrink-0 size-5" />
					</Button>
				</div>
			))}

			{/* 2. 添加新项的区域 */}
			<div className="flex items-center gap-2">
				<Input
					{...props}
					value={pending}
					placeholder={placeholder}
					onChange={(e) => setPending(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault(); // 必加：防止触发表单提交
							handleAdd();
						}
					}}
				/>
				<Button
					variant="icon"
					size="icon"
					onClick={handleAdd}
					disabled={!pending.trim()}
				>
					<Plus className="shrink-0 size-5" />
				</Button>
			</div>
		</div>
	);
}
