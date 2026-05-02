import hljs from 'highlight.js';
import { defaultMarkdownSerializer } from 'prosemirror-markdown';
import { DOMParser, DOMSerializer, type Node, Schema } from 'prosemirror-model';
import type { Transaction } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import type { RefObject } from 'react';
import { renderToString } from 'react-dom/server';
import { MessageResponse } from '#/components/ai-elements/message';
import { documentSchema } from '#/components/uix/prosemirror/documentSchema.ts';

export const buildNullDoc = (): Node => {
	const parser = DOMParser.fromSchema(documentSchema);
	return parser.parse(document.createElement('div'));
};
export const jsonToDoc = (json?: any): Node => {
	if (!json) {
		return buildNullDoc();
	}
	try {
		return documentSchema.nodeFromJSON(json);
	} catch (error) {
		console.error('Failed to parse JSON to ProseMirror document:', error);
		return buildNullDoc();
	}
};
