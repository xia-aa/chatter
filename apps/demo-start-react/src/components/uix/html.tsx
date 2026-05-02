import type {
	HTMLAttributeAnchorTarget,
	HTMLAttributes,
	ReactNode,
} from 'react';
import { textDefault } from '#/css.ts';
import { cn } from '#/lib/utils.ts';

export const Text = ({
	className = '',
	size = 'sm',
	noStyleLink = false,
	rel, // noreferrer: 防止跨域攻击
	target, // _blank 时打开新tab页
	startContent,
	children,
	...props
}: HTMLAttributes<HTMLSpanElement> & {
	noStyleLink?: boolean;
	target?: HTMLAttributeAnchorTarget;
	startContent?: ReactNode;
	size?: 'sm' | 'md' | 'lg';
}) => {
	const content = (
		<span
			{...props}
			className={cn(
				textDefault,
				{
					'text-xl [&_svg]:size-5 font-bold': size === 'md',
				},
				'leading-5',
				className,
			)}
		>
			{startContent}
			{startContent ? (
				<span className="leading-none relative top-[0.9px]">{children}</span>
			) : (
				children
			)}
			{/* <span className="leading-none relative top-[0.9px]">{children}</span> */}
		</span>
	);

	return content;
};
