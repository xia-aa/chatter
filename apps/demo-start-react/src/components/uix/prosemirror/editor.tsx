import hljs from 'highlight.js';
import { highlightPlugin } from 'prosemirror-highlightjs';
import { inputRules } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { DOMParser, type Node, Schema } from 'prosemirror-model';
import { splitListItem } from 'prosemirror-schema-list';
import { EditorState } from 'prosemirror-state';
import { type Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useDebounceCallback } from 'usehooks-ts';
import { documentSchema } from '#/components/uix/prosemirror/documentSchema.ts';
import {
	codeBlockBoundaryArrowDown,
	codeBlockBoundaryArrowUp,
	codeBlockEnter,
	createCodeBlockBackspace,
} from '#/components/uix/prosemirror/keymap.ts';
import {
	buildNullDocument,
	documentToMd,
	jsonToDocument,
	mdToDocument,
} from '#/components/uix/prosemirror/utils.tsx';
import { exampleSetup } from './config';

type EditorProps = {
	initialValue?: any;
	onSave?: (json: any) => void;
	onKeydown?: (view: EditorView, event: KeyboardEvent) => void | boolean;
	className?: string;
};
export interface TextEditorRef {
	save: () => { json: any; md: string };
	getFileCache: () => Map<string, File>;
}
type JsonNode = {
	type: string;
	attrs?: Record<string, any>;
	content?: JsonNode[];
};
export function findBlobUrls(
	node: JsonNode | undefined,
	blobUrls: string[] = [],
): string[] {
	if (!node) return blobUrls;
	if (typeof node === 'string') return blobUrls;
	if (node.type === 'image' && node.attrs?.src?.startsWith('blob:')) {
		blobUrls.push(node.attrs.src);
	}
	if (node.content) {
		for (const child of node.content) {
			findBlobUrls(child, blobUrls);
		}
	}
	return blobUrls;
}
// 2. 递归替换 URL
export function replaceUrlsInContent(
	node: JsonNode,
	oldUrl: string,
	newUrl: string,
): JsonNode {
	if (!node || typeof node !== 'object') return node;

	if (node.type === 'image' && node.attrs?.src === oldUrl) {
		return { ...node, attrs: { ...node.attrs, src: newUrl } };
	}

	if (node.content) {
		return {
			...node,
			content: node.content.map((child) =>
				replaceUrlsInContent(child, oldUrl, newUrl),
			),
		};
	}

	return node;
}

const PureEditor = forwardRef<TextEditorRef, EditorProps>(
	(
		{
			initialValue,
			onSave,
			onKeydown,
			className = 'p-4 prose dark:prose-invert prose-neutral',
		},
		ref,
	) => {
		const containerRef = useRef<HTMLDivElement>(null);
		const editorRef = useRef<EditorView | null>(null);
		const debouncedSave = useDebounceCallback(() => {
			if (!editorRef.current) return;
			const json = editorRef.current.state.doc.toJSON();
			onSave?.(json);
		}, 1000);

		const save = () => {
			if (!editorRef.current) return { json: null, md: '' };
			const doc = editorRef.current.state.doc;
			return {
				json: doc.toJSON(),
				md: documentToMd(doc),
			};
		};

		const imageFileCacheRef = useRef<Map<string, File>>(new Map());
		const handlePaste = useCallback(
			(view: EditorView, event: ClipboardEvent) => {
				if (!editorRef.current) {
					console.warn('Editor not initialized yet');
					return false;
				}
				console.log('handlePaste');
				const items = event.clipboardData?.items;
				const html = event.clipboardData?.getData('text/html');

				if (!items) {
					console.log('没有items');
					return false;
				}
				if (html) {
					// 如果是 html 说明可能是网络图片 自带 网络链接
					console.log('有html', html);
					return false;
				}
				console.log('有items或者没有html');
				let ret = false;
				for (const item of items) {
					console.log('可能是本地图片');
					if (item.kind === 'file' && item.type.startsWith('image')) {
						// event.preventDefault(); // 阻止默认粘贴行为，避免生成 Base64
						const file = item.getAsFile();
						if (!file) continue;
						console.log('有file', file);
						// 1. 創建本地预览 URL (避免 Base64 佔用內存)
						const localUrl = URL.createObjectURL(file);
						// 【关键】将文件存入缓存，等待提交
						imageFileCacheRef.current.set(localUrl, file);
						// 2. 插入图片节点（暂时使用本地 URL）
						const { image } = editorRef.current.state.schema.nodes;
						// 诊断：检查 image node 是否存在
						console.log('🔍 image node:', image);
						const node = image.create({ src: localUrl });

						// 诊断：检查创建的 node 是否有效
						console.log('🔍 创建的 node:', node);

						const tr = view.state.tr.replaceSelectionWith(node);
						// 诊断：检查 transaction 是否成功
						console.log('🔍 tr.docChanged:', tr.docChanged);
						console.log('🔍 tr.steps:', tr.steps.length);

						// 诊断：如果失败了，看看具体错误
						if (!tr.docChanged) {
							console.log('❌ transaction 没有变化，插入可能失败了');
						}
						view.dispatch(tr);
						ret = true; // 拦截默认行為，防止生成 Base64
					}
					console.log('不是图片');
				}
				return ret;
			},
			[],
		);
		// 暴露给外部的方法
		useImperativeHandle(ref, () => ({
			save,
			getFileCache: () => imageFileCacheRef.current,
		}));
		useEffect(() => {
			if (containerRef.current && !editorRef.current) {
				const state = EditorState.create({
					doc: jsonToDocument(initialValue),
					plugins: [
						keymap({
							Enter: codeBlockEnter,
							Backspace: createCodeBlockBackspace(),
							ArrowUp: codeBlockBoundaryArrowUp,
							ArrowDown: codeBlockBoundaryArrowDown,
						}),
						...exampleSetup({ schema: documentSchema, menuBar: false }),
						highlightPlugin(hljs),
					],
				});

				editorRef.current = new EditorView(containerRef.current, {
					state,
					attributes: {
						// class: 'prose prose-slate max-w-none focus:outline-none min-h-[300px] p-4 cursor-text'
						class: 'cursor-text',
					},
					handleDOMEvents: {
						// handleDOMEvents - 通用 DOM 事件拦截器; 设计目的是「在 ProseMirror 处理之前拦截」
						click(_view, event) {},
						// paste: handlePaste,
						keydown: (view, event) => {
							return onKeydown?.(view, event) ?? false;
						},
					},
					handlePaste, // handlePaste - 专用 paste 处理器 返回 true → 自动 preventDefault()
				});
			}
			return () => {
				if (editorRef.current) {
					editorRef.current.destroy();
					editorRef.current = null;
				}
			};
		}, [initialValue, handlePaste, onKeydown]);
		useEffect(() => {
			if (!editorRef.current) return;
			editorRef.current.setProps({
				dispatchTransaction: (transaction) => {
					const newState = editorRef.current!.state.apply(transaction);
					editorRef.current!.updateState(newState);
					// 3. 內容有变化时，触发保存
					if (transaction.docChanged) debouncedSave()
				},
			});
		}, [debouncedSave]);

		return (
			<div className={`relative max-w-none ${className}`} ref={containerRef} />
		); // <div>2</div>
	},
);
function areEqual(prevProps: EditorProps, nextProps: EditorProps) {
	return (
		prevProps.className === nextProps.className &&
		prevProps.onSave === nextProps.onSave
	);
}

export const TextEditor = memo(PureEditor, areEqual);
