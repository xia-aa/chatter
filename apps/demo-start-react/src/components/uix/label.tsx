'use client';

import { Label as LabelPrimitive } from 'radix-ui';
import * as React from 'react';
import { Button } from '#/components/ui/button';
import { cn } from '../../lib/utils';

export function Label({
	className,
	...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
	return (
		<LabelPrimitive.Root
			data-slot="label"
			className={cn(
				'flex items-center pb-2 gap-2  leading-none text-sm font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
				className,
			)}
			{...props}
		/>
	);
}

export function DescriptionX({
	className,
	size = 'sm',
	maxLine = 2,
	children,
	...props
}: React.HTMLAttributes<HTMLParagraphElement> & {
	size?: 'sm' | 'md' | 'lg';
	maxLine?: number;
}) {
	const [isClamped, setIsClamped] = React.useState(false);
	const textRef = React.useRef<HTMLParagraphElement>(null);
	const [isExpanded, setIsExpanded] = React.useState(false);
	// console.log(textRef.current?.scrollHeight, textRef.current?.clientHeight, {
	// 	isClamped,
	// 	isExpanded,
	// });
	React.useLayoutEffect(() => {
		const el = textRef.current;
		if (!el) return;
		// console.log(el?.scrollHeight, el?.clientHeight);
		if (el.scrollHeight > el.clientHeight) {
			// console.log('clamped');
			setIsClamped(true);
		}
	}, []);

	// 纯数字（1234567890...），在浏览器眼中这被视为一个超长的单字。预设情况下，浏览器不会在单字中间強制换行，除非它遇到了空格或连字符
	// break-all：在任意字元间换行（最适合这种纯数字/无空格场景字串）
	// break-words：在单字太长時強制断行
	return (
		<div>
			<p
				{...props}
				ref={textRef}
				className={cn(
					'text-sm  whitespace-pre-wrap wrap-break-word text-secondary-foreground',
					{
						'text-base leading-[1.15] text-foreground': size === 'md',
					},
					!isExpanded && `line-clamp-${maxLine}`,
					className,
				)}
				children={children}
			/>
			{(isClamped || isExpanded) && (
				<button
					onClick={() => setIsExpanded(!isExpanded)}
					// variant="link"
					// size="sm"
					className="text-xs p-0 h-auto text-muted-foreground hover:text-foreground font-medium hover:underline "
				>
					{isExpanded ? '收起' : '展开'}
				</button>
			)}
		</div>
	);
}
export const Description = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<p className={cn('text-sm text-secondary-foreground', className)}>
			{children}
		</p>
	);
};
