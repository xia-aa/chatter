import { ComponentProps } from 'solid-js';
import { cn } from '../lib/utils';

export function Skeleton(props: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      class={cn('animate-pulse rounded-md bg-primary/10', props.class)}
    />
  );
}
