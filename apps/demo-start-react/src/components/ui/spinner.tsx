import { Loader2Icon } from 'lucide-react';
import { cn } from '#/lib/utils';

function Spinner({
	className,
	show = true,
	wait,
	...props
}: React.ComponentProps<'svg'> & {
	show?: boolean;
	wait?: `delay-${number}`;
}) {
	return (
		<Loader2Icon
			role="status"
			aria-label="Loading"
			className={cn(
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
