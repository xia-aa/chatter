import { Link, type LinkProps } from '@tanstack/react-router';
import type { ComponentProps } from 'react';
import { cn } from '#/lib/utils';

export const NoStyleLink = ({
	className,
	...props
}: ComponentProps<'a'> & LinkProps) => {
	return (
		<Link
			{...props}
			className={cn(
				'text-inherit no-underline inline-flex items-center',
				className,
			)}
		/>
	);
};
