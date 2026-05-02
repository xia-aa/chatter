import { SaveIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { Button as UiButton } from '#/components/ui/button';
import { Spinner } from '#/components/ui/spinner';
import { NoStyleLink } from '#/components/uix/link';
import { cn } from '#/lib/utils';
import { UxTooltip } from '../tooltip';
export interface ButtonProps extends ComponentProps<typeof UiButton> {
	href?: string;
	tip?: React.ReactNode;
	pending?: boolean;
	Icon?: ReactNode;
	classNames?: {
		href?: string;
	};
}
export const ButtonX = ({
	children,
	className,
	classNames,
	variant,
	href,
	pending,
	disabled,
	size,
	Icon,
	tip,
	...props
}: ButtonProps) => {
	variant = href && !variant ? 'ghost' : variant;
	const content = (
		<UiButton
			className={cn(
				'appearance-none select-none subpixel-antialiased overflow-hidden  transform-gpu  cursor-pointer   px-4     leading-[1.15]',
				'active:scale-95 transition-transform duration-100',
				{
					'justify-start': href && variant === 'ghost',
					'p-2 ': size === 'icon-sm',
				},
				className,
			)}
			variant={variant}
			disabled={pending || disabled}
			size={size}
			{...props}
		>
			{Icon ? (
				<span className={cn('shrink-0', { 'animate-spin': pending })}>
					{Icon}
				</span>
			) : (
				pending && <Spinner />
			)}
			{children}
		</UiButton>
	);

	const contentWithLink = href ? (
		<NoStyleLink
			className={cn('flex  justify-start', classNames?.href)}
			href={href}
		>
			{content}
		</NoStyleLink>
	) : (
		content
	);
	return tip ? (
		<UxTooltip content={tip}>{contentWithLink}</UxTooltip>
	) : (
		contentWithLink
	);
};
export const Button = ButtonX;
// 弃用
/** @deprecated   **/
export const LinkButton = ({
	href,
	children,
	className,
	color,
	...props
}: ButtonProps & { href: string }) => (
	<NoStyleLink href={href}>
		{/* 使用父元素 */}
		<Button
			className={cn(' text-inherit font-semibold', className)}
			color={color}
			{...props}
		>
			{children}
		</Button>
	</NoStyleLink>
);

// 弃用
/** @deprecated   **/
export const SaveButton = ({
	type = 'submit',
	color = 'primary',
	children = '保存变更',
	Icon = <SaveIcon />,
	...props
}: ButtonProps) => {
	return (
		<Button {...props} type={type} color={color} Icon={Icon}>
			{children}
		</Button>
	);
};
