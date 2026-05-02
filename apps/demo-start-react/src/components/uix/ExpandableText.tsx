'use client';

import * as React from 'react';
import { Button } from '#/components/ui/button';
import { cn } from '#/lib/utils';

interface ExpandableTextProps {
	/** 文本内容 */
	children?: React.ReactNode;
	/** 最大显示行数，默认为 2 */
	maxLine?: number;
	/** 展开按钮文本 */
	expandText?: string;
	/** 收起按钮文本 */
	collapseText?: string;
	textClassName?: string;
	/** 自定义类名 */
	className?: string;
	/** 按钮自定义类名 */
	buttonClassName?: string;
}

export function ExpandableText({
	children,
	maxLine = 2,
	expandText = '展开',
	collapseText = '收起',
	className,
	textClassName,
	buttonClassName,
}: ExpandableTextProps) {
	const [isExpanded, setIsExpanded] = React.useState(false);
	const [isOverflowing, setIsOverflowing] = React.useState(false);
	const textRef = React.useRef<HTMLDivElement>(null);
	const measureRef = React.useRef<HTMLDivElement>(null);

	// 检测文本是否溢出
	const checkOverflow = React.useCallback(() => {
		const textEl = textRef.current;
		const measureEl = measureRef.current;

		if (!textEl || !measureEl) return;

		// 使用隐藏的测量元素来获取完整高度
		const fullHeight = measureEl.scrollHeight;
		// 获取限制行数后的高度
		const lineHeight = parseFloat(getComputedStyle(textEl).lineHeight) || 24;
		const maxHeight = lineHeight * maxLine;

		setIsOverflowing(fullHeight > maxHeight + 1); // +1 容差
	}, [maxLine]);

	// 监听内容变化和窗口大小变化
	// 注意：children 变化时组件会重新渲染，MutationObserver 会检测到 DOM 变化
	React.useEffect(() => {
		checkOverflow();

		const textEl = textRef.current;
		const measureEl = measureRef.current;

		if (!textEl || !measureEl) return;

		// 使用 ResizeObserver 监听尺寸变化
		const resizeObserver = new ResizeObserver(() => {
			checkOverflow();
		});

		resizeObserver.observe(textEl);
		resizeObserver.observe(measureEl);

		// 使用 MutationObserver 监听内容变化（包括 children 更新导致的 DOM 变化）
		const mutationObserver = new MutationObserver(() => {
			checkOverflow();
		});

		mutationObserver.observe(measureEl, {
			childList: true,
			subtree: true,
			characterData: true,
		});

		return () => {
			resizeObserver.disconnect();
			mutationObserver.disconnect();
		};
	}, [checkOverflow]);

	return (
		<div className={cn('relative ', className)}>
			{/* 隐藏的测量元素，用于获取完整文本高度 */}
			<div
				ref={measureRef}
				aria-hidden="true"
				className="pointer-events-none invisible absolute left-0 right-0 top-0 whitespace-pre-wrap wrap-break-word"
				style={{ position: 'absolute', visibility: 'hidden' }}
			>
				{children}
			</div>

			{/* 实际显示的文本 */}
			<div
				className={cn(
					'text-sm text-secondary-foreground  whitespace-pre-wrap wrap-break-word',
					!isExpanded && 'overflow-hidden',
					textClassName,
				)}
				ref={textRef}
				style={
					!isExpanded
						? {
								display: '-webkit-box',
								WebkitLineClamp: maxLine,
								WebkitBoxOrient: 'vertical',
							}
						: undefined
				}
			>
				{children}
			</div>

			{/* 展开/收起按钮 */}
			{isOverflowing && (
				<Button
					variant="link"
					size="sm"
					className={cn(
						'h-auto p-0 text-xs font-normal text-muted-foreground hover:text-foreground',
						buttonClassName,
					)}
					onClick={() => setIsExpanded(!isExpanded)}
				>
					{isExpanded ? collapseText : expandText}
				</Button>
			)}
		</div>
	);
}
