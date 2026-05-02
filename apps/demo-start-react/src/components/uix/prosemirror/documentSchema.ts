import { DOMParser, type Node, Schema } from 'prosemirror-model';
import { nodes, schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { getImgSrc } from '#/components/uix/img/img.utils.ts';

// bun add prosemirror-model prosemirror-state prosemirror-view prosemirror-inputrules prosemirror-schema-basic prosemirror-schema-list prosemirror-markdown

// 1. 擴展 Nodes 定義
const myNodes = addListNodes(
	schema.spec.nodes,
	'paragraph block*',
	'block',
).append({
	code_block: {
		content: 'text*',
		marks: '',
		group: 'block',
		code: true,
		defining: true,
		attrs: { params: { default: '' } }, // 用於存儲語言名稱
		parseDOM: [
			{
				tag: 'pre',
				preserveWhitespace: 'full',
				getAttrs: (node) => ({
					params: (node as HTMLElement).getAttribute('data-params') || '',
				}),
			},
		],
		toDOM(node) {
			return ['pre', { 'data-params': node.attrs.params }, ['code', 0]];
		},
	},
	image: {
		...nodes.image,
		toDOM(node) {
			console.log('image.toDOM');
			const { src: _src } = node.attrs;
			const src = getImgSrc(_src);
			console.log('getImgSrc', { _src, src });
			return ['img', { ...node.attrs, src }];
		},
	},
});
/**
 * - 创建一个 ProseMirror Schema（文档模式）
 * - nodes：定义文档可以包含的块级元素
      - 基础节点来自 prosemirror-schema-basic
      - 通过 addListNodes 添加列表支持（有序/无序列表）
      - 结构：段落作为基础块，支持嵌套列表
 * - marks：定义文本标记（如 bold、italic、link 等）
 */
export const documentSchema = new Schema({
	nodes: myNodes,
	marks: schema.spec.marks,
});
