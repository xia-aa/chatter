import { X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '#/components/ui/badge';
import { Input } from '#/components/ui/input';

export function TagInput({
	value = [],
	onChange,
}: {
	value: string[];
	onChange: (val: string[]) => void;
}) {
	const [pending, setPending] = useState('');

	const addTag = () => {
		const val = pending.trim();
		if (val && !value.includes(val)) {
			onChange([...value, val]); // 更新 TanStack Form 数组
			setPending('');
		}
	};

	const removeTag = (index: number) => {
		onChange(value.filter((_, i) => i !== index));
	};

	return (
		<div className="flex flex-wrap gap-2 p-2 border rounded-md focus-within:ring-2 ring-ring ring-offset-2">
			{/* 已填写的项（标签展示） */}
			{value.map((item, i) => (
				<Badge key={i} variant="secondary" className="gap-1 px-2">
					{item}
					<button
						type="button" // 关键：防止触发 form submit
						onClick={() => removeTag(i)}
						className="hover:text-destructive"
					>
						<X size={12} />
					</button>
				</Badge>
			))}

			{/* 正在填写的输入框 */}
			<input
				value={pending}
				onChange={(e) => setPending(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault(); // 阻止表单提交
						addTag();
					}
					if (e.key === 'Backspace' && !pending && value.length > 0) {
						removeTag(value.length - 1); // 退格删除最后一项
					}
				}}
				placeholder="输入并回车添加..."
				className="flex-1 bg-transparent outline-none text-sm min-w-[120px]"
			/>
		</div>
	);
}
