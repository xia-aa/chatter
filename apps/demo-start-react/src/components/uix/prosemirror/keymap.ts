import {
	chainCommands,
	exitCode,
	joinDown,
	joinUp,
	lift,
	selectParentNode,
	setBlockType,
	splitBlock,
	toggleMark,
	wrapIn,
} from 'prosemirror-commands';
import { redo, undo } from 'prosemirror-history';
import { undoInputRule } from 'prosemirror-inputrules';
import type { MarkType, NodeType, Schema } from 'prosemirror-model';
import {
	liftListItem,
	sinkListItem,
	splitListItem,
	wrapInList,
} from 'prosemirror-schema-list';
import { type Command, TextSelection } from 'prosemirror-state';

export const codeBlockEnter: Command = (state, dispatch) => {
	const { $from, empty } = state.selection;
	console.log('codeBlockEnter', {
		parentType: $from.parent.type.name,
		'$from.node(-1).type': $from.node(-1)?.type.name,
	});
	// 1. 確保選區是空的（光標狀態）且在段落中
	if (!empty || $from.parent.type.name !== 'paragraph') return false;

	// 2. 獲取當前行的文本內容
	const lineText = $from.parent.textContent;

	// 3. 匹配 ```lang 格式
	const match = lineText.match(/^```([a-z]+)?$/);

	if (match) {
		console.log('Matched code block input:', {
			lang: match[1] || 'none',
		});
		if (dispatch) {
			const lang = match[1] || '';
			const { code_block } = state.schema.nodes;
			// 直接用一個新的 code_block 替換掉整個段落
			const tr = state.tr.replaceWith(
				$from.before(),
				$from.after(),
				code_block.create({ params: lang }),
			);

			// 設置選區到新代碼塊內部
			const newPos = tr.doc.resolve($from.before() + 1);
			tr.setSelection(TextSelection.near(newPos));

			dispatch(tr.scrollIntoView());
		}
		return true; // 拦截回車，不執行原生的換行
	}

	return false;
};

interface BackspaceOptions {
	/** 是否保留 ```ts 文本，若為 false 則直接刪除整行並轉為空段落 */
	keepMarkdownSyntax?: boolean;
}
export const createCodeBlockBackspace = (
	options: BackspaceOptions = {},
): Command => {
	return (state, dispatch) => {
		const { $from, empty } = state.selection;

		if (!empty) return false;

		const parent = $from.parent;
		// if (parent.type.name !== 'code_block')
		// 	return undoInputRule(state, dispatch);
		// 當代碼塊為空時
		if (parent.content.size === 0) {
			if (dispatch) {
				const { paragraph } = state.schema.nodes;
				const tr = state.tr;

				if (parent.type.name === 'code_block' && options.keepMarkdownSyntax) {
					// 保留 ```ts 語法
					const lang = parent.attrs.params || '';
					const textContent = `\`\`\`${lang} `;

					tr.setBlockType($from.before(), $from.after(), paragraph).insertText(
						textContent,
						$from.before() + 1,
					);
				} else if (parent.type.name === 'paragraph') {
					// 空段落 → 直接删除
					tr.delete($from.before(), $from.after());
				} else {
					// 1. 先尝试 undoInputRule
					if (undoInputRule(state, dispatch)) return true;

					// 转为普通空段落
					tr.setBlockType($from.before(), $from.after(), paragraph);
				}

				dispatch(tr.scrollIntoView());
			}
			return true;
		}

		return undoInputRule(state, dispatch);
	};
};
/**
 * 處理代碼塊邊界的自動換行邏輯
 */
export const codeBlockBoundaryArrowUp: Command = (state, dispatch) => {
	const { $from, $to } = state.selection;

	// 1. 確保是光標，且在代碼塊內
	if ($from.parent.type.name !== 'code_block') return false;

	// 判斷光標是否在代碼塊的第一行
	// $from.parentOffset 是光標相對於當前代碼塊開頭的距離
	// 如果光標位置之前沒有換行符，說明在第一行
	const isFirstLine = !$from.parent.textContent
		.slice(0, $from.parentOffset)
		.includes('\n');

	if (isFirstLine) {
		console.log('isFirstLine', {
			'$from.before()': $from.before(),
		});
		// 如果上方沒有節點了（它是文檔第一個節點）
		if ($from.before() === 0) {
			if (dispatch) {
				const { paragraph } = state.schema.nodes;
				// 在最前面插入空行
				const tr = state.tr.insert(0, paragraph.create());
				// 設置光標：新插入的段落起點是 1
				const resolvedPos = tr.doc.resolve(1);
				const selection = TextSelection.near(resolvedPos);
				tr.setSelection(selection);

				dispatch(tr.scrollIntoView()); // 確保視圖跟隨
			}
			return true;
		}
	}
	return false;
};
export const codeBlockBoundaryArrowDown: Command = (state, dispatch) => {
	const { $from, $to } = state.selection;
	// 1. 確保是光標，且在代碼塊內
	if ($from.parent.type.name !== 'code_block') return false;
	console.log('codeBlockBoundaryArrowDown');

	// 判斷光標是否在代碼塊的最後一行
	const isLastLine = !$from.parent.textContent
		.slice($from.parentOffset)
		.includes('\n');

	if (isLastLine) {
		console.log('isLastLine', {
			'$from.after()': $from.after(),
			'state.doc.content.size': state.doc.content.size,
		});
		// 如果下方沒有節點了（它是文檔最後一個節點）
		if ($from.after() === state.doc.content.size) {
			console.log('isLastNode');
			if (dispatch) {
				const { paragraph } = state.schema.nodes;
				// 在最後面插入空行
				const insertPos = state.doc.content.size;
				console.log('insert paragraph');
				const tr = state.tr.insert(insertPos, paragraph.create());
				// 設置光標：跳轉到新插入的段落內部
				// 位置計算：insertPos 是原本的末尾，+1 進入新段落
				const resolvedPos = tr.doc.resolve(insertPos + 1);
				const selection = TextSelection.near(resolvedPos);
				tr.setSelection(selection);

				dispatch(tr.scrollIntoView());
			}
			return true;
		}
	}
	return false;
};

const mac =
	typeof navigator != 'undefined'
		? /Mac|iP(hone|[oa]d)/.test(navigator.platform)
		: false;

/// Inspect the given schema looking for marks and nodes from the
/// basic schema, and if found, add key bindings related to them.
/// This will add:
///
/// * **Mod-b** for toggling [strong](#schema-basic.StrongMark)
/// * **Mod-i** for toggling [emphasis](#schema-basic.EmMark)
/// * **Mod-`** for toggling [code font](#schema-basic.CodeMark)
/// * **Ctrl-Shift-0** for making the current textblock a paragraph
/// * **Ctrl-Shift-1** to **Ctrl-Shift-Digit6** for making the current
///   textblock a heading of the corresponding level
/// * **Ctrl-Shift-Backslash** to make the current textblock a code block
/// * **Ctrl-Shift-8** to wrap the selection in an ordered list
/// * **Ctrl-Shift-9** to wrap the selection in a bullet list
/// * **Ctrl->** to wrap the selection in a block quote
/// * **Enter** to split a non-empty textblock in a list item while at
///   the same time splitting the list item
/// * **Mod-Enter** to insert a hard break
/// * **Mod-_** to insert a horizontal rule
/// * **Backspace** to undo an input rule
/// * **Alt-ArrowUp** to `joinUp`
/// * **Alt-ArrowDown** to `joinDown`
/// * **Mod-BracketLeft** to `lift`
/// * **Escape** to `selectParentNode`
///
/// You can suppress or map these bindings by passing a `mapKeys`
/// argument, which maps key names (say `"Mod-B"` to either `false`, to
/// remove the binding, or a new key name string.
export function buildKeymap(
	schema: Schema,
	mapKeys?: { [key: string]: false | string },
) {
	const keys: { [key: string]: Command } = {};
	let schemaType: MarkType | NodeType | undefined;
	function bind(key: string, cmd: Command) {
		if (mapKeys) {
			const mapped = mapKeys[key];
			if (mapped === false) return;
			if (mapped) key = mapped;
		}
		keys[key] = cmd;
	}

	bind('Mod-z', undo);
	bind('Shift-Mod-z', redo);
	bind('Backspace', undoInputRule);
	bind('Mod-Shift-Enter', splitBlock);
	if (!mac) bind('Mod-y', redo);

	bind('Alt-ArrowUp', joinUp);
	bind('Alt-ArrowDown', joinDown);
	bind('Mod-BracketLeft', lift);
	bind('Escape', selectParentNode);
	if (schema.marks.strong) {
		schemaType = schema.marks.strong;
		bind('Mod-b', toggleMark(schemaType));
		bind('Mod-B', toggleMark(schemaType));
	}
	if (schema.marks.em) {
		schemaType = schema.marks.em;
		bind('Mod-i', toggleMark(schemaType));
		bind('Mod-I', toggleMark(schemaType));
	}
	if (schema.marks.code) {
		schemaType = schema.marks.code;
		bind('Mod-`', toggleMark(schemaType));
	}

	if (schema.nodes.bullet_list) {
		schemaType = schema.nodes.bullet_list;
		bind('Shift-Ctrl-8', wrapInList(schemaType));
	}
	if (schema.nodes.ordered_list) {
		schemaType = schema.nodes.ordered_list;
		bind('Shift-Ctrl-9', wrapInList(schemaType));
	}
	if (schema.nodes.blockquote) {
		schemaType = schema.nodes.blockquote;
		bind('Ctrl->', wrapIn(schemaType));
	}
	/**
| 快捷键         | 实际行为（exampleSetup）                      |
| ------------- | --------------------------------------- |
| `Enter`       | `splitBlock` → 段落中插入**新段落**；代码块中插入 `\n` |
| `Shift+Enter` | `insertHardBreak` → 插入 `<br>` **硬换行**   |
| `Mod+Enter`   | `exitCode` → **仅对代码块有效**：退出代码块          |

	 */
	if (schema.nodes.hard_break) {
		// Mod: macOS(Cmd), Windows \ Linux (Ctrl)
		schemaType = schema.nodes.hard_break;
		const br = schemaType;
		// exitCode: 光标在代码块 则 向下创建 新的段落，否则 插入硬换行
		const cmd = chainCommands(exitCode, (state, dispatch) => {
			if (dispatch)
				dispatch(state.tr.replaceSelectionWith(br.create()).scrollIntoView());
			return true;
		}); // 按顺序尝试执行命令; 如果 exitCode 返回 false，就执行 dispatch(state.tr.replaceSelectionWith(br.create()).scrollIntoView())
		bind('Mod-Enter', cmd);
		bind('Shift-Enter', cmd);
		if (mac) bind('Ctrl-Enter', cmd);
	}
	if (schema.nodes.list_item) {
		schemaType = schema.nodes.list_item;
		bind('Enter', splitListItem(schemaType));
		bind('Mod-[', liftListItem(schemaType));
		bind('Mod-]', sinkListItem(schemaType));
	}
	if (schema.nodes.paragraph) {
		schemaType = schema.nodes.paragraph;
		bind('Shift-Ctrl-0', setBlockType(schemaType));
	}
	if (schema.nodes.code_block) {
		schemaType = schema.nodes.code_block;
		bind('Shift-Ctrl-\\', setBlockType(schemaType));
	}
	if (schema.nodes.heading) {
		schemaType = schema.nodes.heading;
		for (let i = 1; i <= 6; i++)
			bind('Shift-Ctrl-' + i, setBlockType(schemaType, { level: i }));
	}
	if (schema.nodes.horizontal_rule) {
		schemaType = schema.nodes.horizontal_rule;
		const hr = schemaType;
		bind('Mod-_', (state, dispatch) => {
			if (dispatch)
				dispatch(state.tr.replaceSelectionWith(hr.create()).scrollIntoView());
			return true;
		});
	}

	return keys;
}
