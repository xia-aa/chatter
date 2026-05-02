import {
	ellipsis,
	emDash,
	InputRule,
	inputRules,
	smartQuotes,
	textblockTypeInputRule,
	wrappingInputRule,
} from 'prosemirror-inputrules';
import type { NodeType, Schema } from 'prosemirror-model';

/// Given a blockquote node type, returns an input rule that turns `"> "`
/// at the start of a textblock into a blockquote.
export function blockQuoteRule(nodeType: NodeType) {
	return wrappingInputRule(/^\s*>\s$/, nodeType);
}

/// Given a list node type, returns an input rule that turns a number
/// followed by a dot at the start of a textblock into an ordered list.
export function orderedListRule(nodeType: NodeType) {
	return wrappingInputRule(
		/^(\d+)\.\s$/,
		nodeType,
		(match) => ({ order: +match[1] }),
		(match, node) => node.childCount + node.attrs.order == +match[1],
	);
}

/// Given a list node type, returns an input rule that turns a bullet
/// (dash, plush, or asterisk) at the start of a textblock into a
/// bullet list.
export function bulletListRule(nodeType: NodeType) {
	return wrappingInputRule(/^\s*([-+*])\s$/, nodeType);
}

/**
 * 代码块快捷规则
 * 匹配 ``` 后直接空格，转换为代码块并设置语言属性
 * 输入规则无法有效实现 当回车 则会转换为代码块, 因此需要 通过绑定 快捷键 与 command 实现
 */
export function codeBlockRule(nodeType: NodeType) {
	return new InputRule(
		/^```([a-z]+)?\s$/, // 這裡的 \s 匹配空格或回車觸發的空白字符
		(state, match, start, end) => {
			const lang = match[1] || '';

			const tr = state.tr;

			// 1. 刪除用戶輸入的 ```ts 和後面的回車 (start 到 end 的範圍)
			tr.delete(start, end);

			// 2. 將當前所在的段落節點轉換為 code_block
			// 註：delete 之後，原本的行依然存在，只是內容空了
			// 我們使用 setBlockType 將其轉為代碼塊
			return tr.setBlockType(start, start, nodeType, { params: lang });
		},
	);
}
/**
 **标题快捷规则** (`headingRule`)
- 根据 Markdown 语法识别标题输入
- **参数**：`maxLevel` - 标题级别（1-6）
- **工作原理**：
  - 匹配正则表达式 `^(#{1,maxLevel})\s$`（行首多个 `#` 后跟空格）
  - 自动将输入转换为对应级别的标题
  - 例：输入 `### ` 自动转为三级标题
 */
export function headingRule(nodeType: NodeType, maxLevel: number) {
	return textblockTypeInputRule(
		new RegExp(`^(#{1,${maxLevel}})\\s$`),
		nodeType,
		(match) => ({ level: match[1].length }),
	);
}
/// A set of input rules for creating the basic block quotes, lists,
/// code blocks, and heading.
export function buildInputRules(schema: Schema) {
	const rules = smartQuotes.concat(ellipsis, emDash);
	if (schema.nodes.blockquote)
		rules.push(blockQuoteRule(schema.nodes.blockquote));
	if (schema.nodes.ordered_list)
		rules.push(orderedListRule(schema.nodes.ordered_list));
	if (schema.nodes.bullet_list)
		rules.push(bulletListRule(schema.nodes.bullet_list));
	if (schema.nodes.code_block)
		rules.push(codeBlockRule(schema.nodes.code_block));
	if (schema.nodes.heading) rules.push(headingRule(schema.nodes.heading, 6));
	return inputRules({ rules });
}
