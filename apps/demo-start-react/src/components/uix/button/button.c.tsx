'use client';
import type { VariantProps } from 'class-variance-authority';
import { Check, Copy } from 'lucide-react';
import { type ButtonHTMLAttributes, useState } from 'react';
import { useCopyToClipboard } from 'usehooks-ts';
import { Button, type buttonVariants } from '#/components/ui/button';
import { toastError } from '#/components/uix/toast';
import { focusCss } from '#/css';
import { cn } from '#/lib/utils';
import type { Icon } from '../img/types';
import { type ButtonProps, Button as ButtonX } from '.';

export interface ActionButtonProps
	extends Omit<ButtonProps, 'onClick' | 'pending'> {
	onClick?: () => any | Promise<any>;
}
export const ActionButton = ({ onClick, ...props }: ActionButtonProps) => {
	const [pending, setPending] = useState(false);
	const handleClick = async () => {
		setPending(true);
		try {
			await onClick?.();
		} catch (err) {
			toastError(err);
		} finally {
			setPending(false);
		}
	};
	//
	return <ButtonX onClick={handleClick} pending={pending} {...props} />;
};
export const ActionDiv = ({
	onClick,
	children,
	className = '',
	...props
}: Omit<ButtonHTMLAttributes<HTMLDivElement>, 'onClick'> & {
	onClick?: () => any | Promise<any>;
}) => {
	const [pending, setPending] = useState(false);
	const handleClick = async () => {
		setPending(true);
		try {
			await onClick?.();
		} catch (err) {
			toastError(err);
		} finally {
			setPending(false);
		}
	};
	return (
		<div onClick={handleClick} className={cn(focusCss, className)} {...props}>
			{children}
		</div>
	);
};

export interface ActionItem {
	key: string;
	path?: string;
	onClick?: () => any | Promise<any>;
	icon?: Icon;
	label?: string;
	className?: string;
	// description?: string;
	// badge?: string | number | null;
}
export const ActionList = ({
	items = [],
	withIcon = true,
	className = '',
}: {
	items?: ActionItem[];
	withIcon?: boolean;
	className?: string;
}) => {
	return (
		<>
			{items.map((item) => {
				const Icon = item.icon;
				return (
					<ActionButton
						key={item.key}
						onClick={item.onClick}
						href={item.path}
						className={cn('w-full justify-start', item.className)}
						variant="ghost"
					>
						{withIcon && Icon && <Icon size={16} />}
						<span className="relative top-[0.9px]">{item.label}</span>
					</ActionButton>
				);
			})}
		</>
	);
};

export const CopyButton = ({
	text,
	className = '',
	children,
	...props
}: {
	text: string;
	className?: string;
	children?: React.ReactNode;
} & VariantProps<typeof buttonVariants>) => {
	const [copiedText, copy] = useCopyToClipboard();
	return (
		<Button onClick={() => copy(text)} className={className} {...props}>
			{copiedText ? <Check className="text-primary" /> : <Copy className="" />}
			{children}
		</Button>
	);
};
