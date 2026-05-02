import hljs from 'highlight.js';
import { defaultMarkdownSerializer } from 'prosemirror-markdown';
import { DOMParser, DOMSerializer, type Node, Schema } from 'prosemirror-model';
import { documentSchema } from '#/components/uix/prosemirror/documentSchema.ts';
import { jsonToDoc } from '#/components/uix/prosemirror/transformer/json.ts';
// ProseMirror document node -> Markdown content

export const jsonToHtml = (json?: any): string => {
	const doc = jsonToDoc(json);
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
