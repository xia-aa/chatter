import { createEditor, type NodeJSON, union } from 'prosekit/core';
import type { EditorState, Transaction } from 'prosekit/pm/state';
import { ProseKit, useDocChange, useKeymap } from 'prosekit/react';
import type { Node } from 'prosemirror-model';
import type { EditorView } from 'prosemirror-view';
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	htmlFromMarkdown,
	markdownFromHTML,
} from '#/components/uix/md/transformer/mdAndHtml.ts';
import { defineExtension } from '#/components/uix/prosekit/extension.ts';
import { UseKeymap } from '#/components/uix/prosekit/UseKeymap.tsx';

export interface TextEditorRef {
	save: () => { json: NodeJSON; md: string };
	getFileCache: () => Map<string, File>;
}

export type EditorProps = {
	initialValue?: string;
	onSave?: (json: any) => void;
	className?: string;
	onKeydown?: () => void;
};
export const TextEditor = forwardRef<TextEditorRef, EditorProps>(
	(
		{
			initialValue,
			onSave,
			className = 'p-4 prose dark:prose-invert prose-neutral',
			onKeydown,
		},
		ref,
	) => {
		const imageFileCacheRef = useRef(new Map<string, File>());
		const editor = useMemo(
			() =>
				createEditor({
					extension: defineExtension(),
					defaultContent: htmlFromMarkdown(initialValue),
				}),
			[initialValue],
		);

		// 保存方法
		const save = useCallback(() => {
			const html = editor.getDocHTML();
			const md = markdownFromHTML(html);
			const json = editor.getDocJSON();
			return { json, md };
		}, [editor]);

		useImperativeHandle(
			ref,
			() => ({
				save,
				getFileCache: () => imageFileCacheRef.current,
			}),
			[save],
		);
		const handleDocChange = useCallback(
			(doc: Node) => onSave?.(markdownFromHTML(editor.getDocHTML())),
			[onSave, editor.getDocHTML],
		);
		useDocChange(handleDocChange, { editor });

		return (
			<ProseKit editor={editor}>
				<div className="cursor-text">
					<div
						ref={editor.mount}
						className={`relative max-w-none ${className}`}
					/>
					<UseKeymap onKeydown={onKeydown} />
				</div>
			</ProseKit>
		);
	},
);
