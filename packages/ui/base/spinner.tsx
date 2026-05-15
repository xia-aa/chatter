import { LoaderCircle } from 'lucide-solid';
import { cn } from '../lib/utils';
import type { ComponentProps, JSX } from 'solid-js';

function Spinner({
	class: className,
	show = true,
	wait,
	...props
}: ComponentProps<'svg'> & {
	show?: boolean;
	wait?: `delay-${number}`;
}) {
	return (
		<LoaderCircle
			role="status"
			aria-label="Loading"
			class={cn(
				'size-4 animate-spin',
				show
					? `opacity-100 duration-500 ${wait ?? 'delay-300'}`
					: 'duration-500 opacity-0 delay-0',
				className,
			)}
			{...props}
		/>
	);
}

export { Spinner };
