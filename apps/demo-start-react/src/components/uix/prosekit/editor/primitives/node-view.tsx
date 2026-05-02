import { useNodeViewContext } from '@prosemirror-adapter/react';
import type { ElementType, ReactNode } from 'react';

interface NodeViewWrapperProps {
	as?: ElementType;
	children?: ReactNode;
}
export function NodeViewWrapper({
	as: Component = 'div',
	children,
	...rest
}: NodeViewWrapperProps) {
	const context = useNodeViewContext();
	return (
		<Component
			{...rest}
			className={context.selected ? 'ProseMirror-selectednode' : ''}
		>
			{children}
		</Component>
	);
}
