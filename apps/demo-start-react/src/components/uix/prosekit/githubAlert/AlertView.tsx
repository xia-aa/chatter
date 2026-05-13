import { useNodeViewContext } from '@prosemirror-adapter/react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';
import { useMemo } from 'react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu.tsx';
import { NodeViewWrapper } from '#/components/uix/prosekit/editor/primitives/node-view';
import styles from './AlertView.module.css';
import type { GithubAlertType } from './config';
import { githubAlertTypeKeys, githubAlertTypeMap } from './config';

export function AlertView() {
	const context = useNodeViewContext();

	const selectedType = useMemo(
		() => context.node.attrs.type as GithubAlertType,
		[context.node.attrs.type],
	);

	const data = githubAlertTypeMap[selectedType];

	if (!data) return null;

	return (
		<NodeViewWrapper>
			<div
				className={`markdown-alert markdown-alert-${context.node.attrs.type}`}
				dir="auto"
			>
				<p className={clsx(styles.gitHubAlertTitle, 'markdown-alert-title')} dir="auto">
					<DropdownMenu>
						<DropdownMenuTrigger className={styles.gitHubAlertSwitchButton}>
							<data.icon />
							{data.label}
							<ChevronDown size={12} />
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuRadioGroup
								value={selectedType}
								onValueChange={(value) => context.setAttrs({ type: value })}
							>
								{githubAlertTypeKeys.map((key) => (
									<DropdownMenuRadioItem key={key} value={key}>
										{githubAlertTypeMap[key].label}
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</p>
				<div ref={context.contentRef} className={styles.gitHubAlertParagraph} />
			</div>
		</NodeViewWrapper>
	);
}
