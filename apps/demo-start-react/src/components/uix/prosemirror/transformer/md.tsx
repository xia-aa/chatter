import hljs from 'highlight.js';
import {
	defaultMarkdownParser,
	defaultMarkdownSerializer,
} from 'prosemirror-markdown';
import { DOMParser, DOMSerializer, type Node, Schema } from 'prosemirror-model';
import type { Transaction } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import type { RefObject } from 'react';
import { renderToString } from 'react-dom/server';
import { MessageResponse } from '#/components/ai-elements/message';
import { documentSchema } from '#/components/uix/prosemirror/documentSchema.ts';
import { jsonToDoc } from '#/components/uix/prosemirror/transformer/json.ts';

// ProseMirror document node -> Markdown content
export const docToMd = (document: Node): string => {
	return defaultMarkdownSerializer.serialize(document);
};
export const mdToDoc = (content: string): Node => {
	return jsonToDoc(mdToJson(content));
};
export const jsonToMd = (json?: any): string => {
	return docToMd(jsonToDoc(json));
};
export const mdToJson = (md?: string | null): any => {
	if (!md) return;
	const doc = defaultMarkdownParser.parse(md);
	return doc.toJSON();
};

export const streamMdToDoc = (content: string): Node => {
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
