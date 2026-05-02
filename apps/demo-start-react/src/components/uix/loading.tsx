import { Spinner } from '#/components/ui/spinner';
import { cn } from '#/lib/utils';

export function UxSpinner({
	show,
	wait,
	className = '',
}: {
	show?: boolean;
	wait?: `delay-${number}`;
	className?: string;
}) {
	return (
		<div
			className={`inline-block animate-spin px-3 transition ${
				(show ?? true)
					? `opacity-100 duration-500 ${wait ?? 'delay-300'}`
					: 'duration-500 opacity-0 delay-0'
			} ${className}`}
		>
			⍥
		</div>
	);
}

export function Loading({
	className = 'size-6 text-primary',
	...props
}: React.ComponentProps<'svg'>) {
	return <Spinner className={className} {...props} />;
}

export function LoadingPage() {
	return (
		<div className="size-full flex justify-center">
			<Spinner className="size-20" />
		</div>
	);
}

export function Skeleton({
	className,
	isPulse = true,
	...props
}: React.HTMLAttributes<HTMLDivElement> & {
	isPulse?: boolean;
}) {
	return (
		<div
			className={cn(
				'rounded-md bg-accent',
				{ 'animate-pulse': isPulse },
				className,
			)}
			{...props}
		/>
	);
}
