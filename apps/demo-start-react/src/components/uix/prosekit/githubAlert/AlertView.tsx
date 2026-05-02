import type { NodeViewContextProps } from '@prosemirror-adapter/solid';
import { useNodeViewContext } from '@prosemirror-adapter/solid';
import { clsx } from 'clsx';
import { LucideChevronDown } from 'lucide-react';
import { createMemo, For, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';
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

export function AlertView(props: NodeViewContextProps) {
	const context = useNodeViewContext();

	const selectedType = createMemo(
		() => context().node.attrs.type as GithubAlertType,
	);

	return (
		<NodeViewWrapper>
			<div
				className={`markdown-alert markdown-alert-${context().node.attrs.type}`}
				dir={'auto'}
			>
				<Show when={githubAlertTypeMap[selectedType()]}>
					{(data) => (
						<p
							className={clsx(styles.gitHubAlertTitle, 'markdown-alert-title')}
							dir={'auto'}
						>
							<DropdownMenu>
								<DropdownMenuTrigger className={styles.gitHubAlertSwitchButton}>
									<Dynamic component={data().icon} />
									{data().label}

									<LucideChevronDown size={12} />
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuRadioGroup
										value={selectedType()}
										onChange={(value) => context().setAttrs({ type: value })}
									>
										<For each={githubAlertTypeKeys}>
											{(key) => (
												<DropdownMenuRadioItem value={key}>
													{githubAlertTypeMap[key].label}
												</DropdownMenuRadioItem>
											)}
										</For>
									</DropdownMenuRadioGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						</p>
					)}
				</Show>
				<div
					ref={props.contentRef}
					className={`${styles.gitHubAlertParagraph}`}
				/>
			</div>
		</NodeViewWrapper>
	);
}
