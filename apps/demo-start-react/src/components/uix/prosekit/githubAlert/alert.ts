import { toProseMirrorNode } from '@prosemirror-processor/unist/mdast';
import type { BlockContent, Blockquote } from 'mdast';
import {
	defineCommands,
	defineKeymap,
	defineNodeSpec,
	insertNode,
	isAtBlockStart,
	toggleWrap,
	union,
	wrap,
} from 'prosekit/core';
import { defineWrappingInputRule } from 'prosekit/extensions/input-rule';
import { defineReactNodeView } from 'prosekit/react';
import { joinBackward } from 'prosemirror-commands';
import type { TagParseRule } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';
import { AlertView } from './AlertView';
import type { GithubAlertType } from './config';
import { githubAlertTypeMap } from './config';

function defineGitHubAlertCommands() {
	return defineCommands({
		setAlert: (type: GithubAlertType) => {
			return wrap({ type: 'githubAlert', attrs: { type } });
		},
		insertAlert: (type: GithubAlertType) => {
			return insertNode({ type: 'githubAlert', attrs: { type } });
		},
		toggleAlert: (type: GithubAlertType) => {
			return toggleWrap({ type: 'githubAlert', attrs: { type } });
		},
	});
}

function defineGitHubAlertInputRule() {
	return union(
		...Object.values(githubAlertTypeMap).map((map) =>
			defineWrappingInputRule({
				regex: map.shortcutRegexp,
				type: 'githubAlert',
				attrs: {
					type: map.type,
				},
			}),
		),
	);
}

function backspaceUnsetBlockquote(): Command {
	return (state, dispatch, view) => {
		const $pos = isAtBlockStart(state, view);
		if ($pos?.node(-1).type.name === 'githubAlert') {
			return joinBackward(state, dispatch, view);
		}
		return false;
	};
}

function defineGitHubAlertKeymap() {
	return defineKeymap({
		Backspace: backspaceUnsetBlockquote(),
	});
}

function defineGitHubAlertSpec() {
	return defineNodeSpec({
		name: 'githubAlert',
		content: 'block+',
		selectable: true,
		draggable: true,

		parseDOM: [
			{ tag: 'blockquote[data-alert]' },

			...Object.values(githubAlertTypeMap).map(({ type }) => {
				return {
					tag: `div.markdown-alert.markdown-alert-${type}`,
					attrs: {
						type,
					},
					contentElement: (el) => {
						if ('querySelector' in el) {
							const title = el.querySelector('.markdown-alert-title');
							title && title.remove();
						}
						return el;
					},
				} satisfies TagParseRule;
			}),
		],
		attrs: {
			type: {
				default: 'note',
			},
		},
		toDOM: (node) => {
			return [
				'div',
				{
					class: `markdown-alert markdown-alert-${node.attrs.type}`,
				},
				0,
			];
		},
		// ts-expect-error TODO: fix types
		__toUnist: (node, parent, context) => {
			const type = githubAlertTypeMap[node.attrs.type as GithubAlertType];
			const children = context.handleAll(node);
			return {
				type: 'blockquote',
				children: [
					{ type: 'text', value: type.match },
					...(children as Array<BlockContent>),
				],
			} as Blockquote;
		},

		__fromUnist: toProseMirrorNode('githubAlert', (node) => {
			// @ts-expect-error TODO: fix types
			return { type: node['variant'] };
		}),
	});
}

function defineGitHubAlertSpecView() {
	return defineReactNodeView({
		name: 'githubAlert',
		component: AlertView,
		contentAs: 'div',
	});
}

export function defineGitHubAlert() {
	return union(
		defineGitHubAlertSpec(),
		defineGitHubAlertInputRule(),
		defineGitHubAlertCommands(),
		defineGitHubAlertKeymap(),
		defineGitHubAlertSpecView(),
	);
}
