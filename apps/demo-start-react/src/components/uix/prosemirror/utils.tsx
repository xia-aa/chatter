import hljs from 'highlight.js';
import { defaultMarkdownSerializer } from 'prosemirror-markdown';
import { DOMParser, DOMSerializer, type Node, Schema } from 'prosemirror-model';
import type { Transaction } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import type { RefObject } from 'react';
import { renderToString } from 'react-dom/server';
import { MessageResponse } from '#/components/ai-elements/message';
import { documentSchema } from '#/components/uix/prosemirror/documentSchema.ts';

export const mdToDocument = (content: string): Node => {
	const parser = DOMParser.fromSchema(documentSchema);
	// Markdown content -> html string
	const stringFromMarkdown = renderToString(
		<MessageResponse>{content}</MessageResponse>,
	);
	const tempContainer = document.createElement('div');
	tempContainer.innerHTML = stringFromMarkdown;
	// html node -> ProseMirror document node
	return parser.parse(tempContainer);
};
export const buildNullDocument = (): Node => {
	const parser = DOMParser.fromSchema(documentSchema);
	return parser.parse(document.createElement('div'));
};
export const jsonToDocument = (json?: any): Node => {
	if (!json) {
		return buildNullDocument();
	}
	try {
		return documentSchema.nodeFromJSON(json);
	} catch (error) {
		console.error('Failed to parse JSON to ProseMirror document:', error);
		return buildNullDocument();
	}
};
export const jsonToHtml = (json?: any): string => {
	const doc = jsonToDocument(json);
	try {
		const serializer = DOMSerializer.fromSchema(documentSchema);
		const fragment = serializer.serializeFragment(doc.content);
		// DocumentFragment → HTML 字符串
		const div = document.createElement('div');
		div.appendChild(fragment);
		// 手动对代码块执行 highlight.js 高亮
		div.querySelectorAll('pre code').forEach((block) => {
			hljs.highlightElement(block as HTMLElement);
		});
		return div.innerHTML;
	} catch {
		return '<p>[无法显示的消息]</p>';
	}
};
// ProseMirror document node -> Markdown content
export const documentToMd = (document: Node): string => {
	return defaultMarkdownSerializer.serialize(document);
};
