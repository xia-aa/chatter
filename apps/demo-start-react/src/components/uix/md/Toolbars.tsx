/** biome-ignore-all lint/style/noNonNullAssertion: 参考 react-md-editor/src/commands */
// import {
// 	Modal,
// 	ModalContent,
// 	ModalHeader,
// 	ModalBody,
// 	ModalFooter,
// 	Button,
// 	useDisclosure,
// 	Tabs,
// 	Tab,
// 	Card,
// 	CardBody,
// 	Form,
// } from "@heroui/react";
import {
	type AlterLineFunction,
	type ExecuteState,
	executeCommand,
	getBreaksNeededForEmptyLineAfter,
	getBreaksNeededForEmptyLineBefore,
	headingExecute,
	type ICommand,
	insertBeforeEachLine,
	selectWord,
	type TextAreaTextApi,
} from '@uiw/react-md-editor';
import {
	Bold,
	ChevronDown,
	Code,
	Form,
	Heading1,
	Heading2,
	Heading3,
	ImageIcon,
	Italic,
	LinkIcon,
	List,
	ListChecks,
	ListOrdered,
	ListTodo,
	Strikethrough,
	TextQuote,
	TvIcon,
} from 'lucide-react';
import { type FormEvent, type ReactNode, useRef, useState } from 'react';
import { toast } from 'sonner';
import z from 'zod';
import { Button } from '#/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu';
import { Input } from '#/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs';
import { useAppForm } from '#/components/uix/form/useAppForm';
import { Img } from '#/components/uix/img/Img';
import { Description, Label } from '#/components/uix/label';
import { Modal } from '#/components/uix/modal/modal';
import { UxTooltip } from '#/components/uix/tooltip';
import { uploadSingleFile } from '#/lib/upload/_client';
import FileDropzone from '#/lib/upload/FileDropzone';

const CommandButton = (title: string, icon: ReactNode) => {
	return (
		command: ICommand,
		disabled: boolean,
		executeCommand: (command: ICommand<string>, name?: string) => void,
	) => (
		<UxTooltip content={title}>
			<Button
				// isIconOnly
				disabled={disabled}
				className="bg-transparent"
				onPointerUp={(evn) => {
					// evn.stopPropagation();
					executeCommand(command, command.groupName);
				}}
			>
				{icon}
			</Button>
		</UxTooltip>
	);
};

export const title1: ICommand = {
	name: 'heading1',
	keyCommand: 'heading1',
	shortcuts: 'ctrlcmd+1',
	prefix: '# ',
	suffix: '',
	render: CommandButton('1级标题', <Heading1 />),
	execute: (state, api) => {
		headingExecute({
			state,
			api,
			prefix: state.command.prefix!,
			suffix: state.command.suffix,
		});
	},
};

export const title2: ICommand = {
	name: 'heading2',
	keyCommand: 'heading2',
	shortcuts: 'ctrlcmd+2',
	prefix: '## ',
	suffix: '',
	render: CommandButton('2级标题', <Heading2 />),
	execute: (state, api) => {
		headingExecute({
			state,
			api,
			prefix: state.command.prefix!,
			suffix: state.command.suffix,
		});
	},
};

export const title3: ICommand = {
	name: 'heading3',
	keyCommand: 'heading3',
	shortcuts: 'ctrlcmd+3',
	prefix: '### ',
	suffix: '',
	render: CommandButton('3级标题', <Heading3 />),
	execute: (state, api) => {
		headingExecute({
			state,
			api,
			prefix: state.command.prefix!,
			suffix: state.command.suffix,
		});
	},
};

export const bold: ICommand = {
	name: 'bold',
	keyCommand: 'bold',
	shortcuts: 'ctrlcmd+b',
	prefix: '**',
	render: CommandButton('粗体', <Bold />),
	execute: (state, api) => {
		const newSelectionRange = selectWord({
			text: state.text,
			selection: state.selection,
			prefix: state.command.prefix!,
		});
		const state1 = api.setSelectionRange(newSelectionRange);
		executeCommand({
			api,
			selectedText: state1.selectedText,
			selection: state.selection,
			prefix: state.command.prefix!,
		});
	},
};
export const italic: ICommand = {
	name: 'italic',
	keyCommand: 'italic',
	shortcuts: 'ctrlcmd+i',
	prefix: '*',
	render: CommandButton('斜体', <Italic />),
	execute: (state, api) => {
		const newSelectionRange = selectWord({
			text: state.text,
			selection: state.selection,
			prefix: state.command.prefix!,
		});
		const state1 = api.setSelectionRange(newSelectionRange);
		executeCommand({
			api,
			selectedText: state1.selectedText,
			selection: state.selection,
			prefix: state.command.prefix!,
		});
	},
};

export const strikethrough: ICommand = {
	name: 'strikethrough',
	keyCommand: 'strikethrough',
	shortcuts: 'ctrl+shift+x',
	prefix: '~~',
	render: CommandButton('删除线', <Strikethrough />),
	execute: (state: ExecuteState, api: TextAreaTextApi) => {
		const newSelectionRange = selectWord({
			text: state.text,
			selection: state.selection,
			prefix: state.command.prefix!,
		});
		const state1 = api.setSelectionRange(newSelectionRange);
		executeCommand({
			api,
			selectedText: state1.selectedText,
			selection: state.selection,
			prefix: state.command.prefix!,
		});
	},
};
export const quote: ICommand = {
	name: 'quote',
	keyCommand: 'quote',
	shortcuts: 'ctrlcmd+q',
	prefix: '> ',
	buttonProps: {
		'aria-label': 'Insert a quote (ctrl + q)',
		title: 'Insert a quote (ctrl + q)',
	},
	render: CommandButton('引用', <TextQuote />),
	execute: (state: ExecuteState, api: TextAreaTextApi) => {
		const newSelectionRange = selectWord({
			text: state.text,
			selection: state.selection,
			prefix: state.command.prefix!,
		});
		const state1 = api.setSelectionRange(newSelectionRange);
		const breaksBeforeCount = getBreaksNeededForEmptyLineBefore(
			state1.text,
			state1.selection.start,
		);
		const breaksBefore = Array(breaksBeforeCount + 1).join('\n');

		const breaksAfterCount = getBreaksNeededForEmptyLineAfter(
			state1.text,
			state1.selection.end,
		);
		const breaksAfter = Array(breaksAfterCount + 1).join('\n');

		const modifiedText = insertBeforeEachLine(
			state1.selectedText,
			state.command.prefix!,
		);
		api.replaceSelection(
			`${breaksBefore}${modifiedText.modifiedText}${breaksAfter}`,
		);

		const selectionStart = state1.selection.start + breaksBeforeCount;
		const selectionEnd = selectionStart + modifiedText.modifiedText.length;
		api.setSelectionRange({ start: selectionStart, end: selectionEnd });
	},
};
export const codeBlock: ICommand = {
	name: 'codeBlock',
	keyCommand: 'codeBlock',
	shortcuts: 'ctrlcmd+shift+j',
	prefix: '```',
	render: CommandButton('代码块', <Code />),
	execute: (state: ExecuteState, api: TextAreaTextApi) => {
		const newSelectionRange = selectWord({
			text: state.text,
			selection: state.selection,
			prefix: '```\n',
			suffix: '\n```',
		});
		const state1 = api.setSelectionRange(newSelectionRange);

		// Based on context determine if new line is needed or not
		let prefix = '\n```\n';
		let suffix = '\n```\n';

		if (
			state1.selectedText.length >= prefix.length + suffix.length - 2 &&
			state1.selectedText.startsWith(prefix) &&
			state1.selectedText.endsWith(suffix)
		) {
			// Remove code block
			prefix = '```\n';
			suffix = '\n```';
		} else {
			// Add code block
			if (
				(state1.selection.start >= 1 &&
					state.text.slice(
						state1.selection.start - 1,
						state1.selection.start,
					) === '\n') ||
				state1.selection.start === 0
			) {
				prefix = '```\n';
			}
			if (
				(state1.selection.end <= state.text.length - 1 &&
					state.text.slice(state1.selection.end, state1.selection.end + 1) ===
						'\n') ||
				state1.selection.end === state.text.length
			) {
				suffix = '\n```';
			}
		}

		const newSelectionRange2 = selectWord({
			text: state.text,
			selection: state.selection,
			prefix,
			suffix,
		});
		const state2 = api.setSelectionRange(newSelectionRange2);
		executeCommand({
			api,
			selectedText: state2.selectedText,
			selection: state.selection,
			prefix,
			suffix,
		});
	},
};

export const details: ICommand = {
	name: 'details',
	keyCommand: 'details',
	shortcuts: 'ctrlcmd+shift+d',
	render: CommandButton('折叠块', <ChevronDown />),
	execute: (state: ExecuteState, api: TextAreaTextApi) => {
		// 获取选中的文本
		const selectedText = state.selectedText || '折叠内容';
		// 创建折叠块模板
		const template = `<details>
<summary>折叠标题</summary>

${selectedText}

</details>

`;
		// 如果没有选中文本，将光标放在折叠标题位置
		if (!state.selectedText) {
			const cursorPosition =
				state.selection.start + template.indexOf('折叠标题');
			api.replaceSelection(template);
			api.setSelectionRange({
				start: cursorPosition,
				end: cursorPosition + 4,
			});
		} else {
			// 如果有选中文本，将其作为折叠内容
			api.replaceSelection(template);
		}
	},
};

export const makeList = (
	state: ExecuteState,
	api: TextAreaTextApi,
	insertBefore: string | AlterLineFunction,
) => {
	const newSelectionRange = selectWord({
		text: state.text,
		selection: state.selection,
		prefix: state.command.prefix!,
	});
	const state1 = api.setSelectionRange(newSelectionRange);

	const breaksBeforeCount = getBreaksNeededForEmptyLineBefore(
		state1.text,
		state1.selection.start,
	);
	const breaksBefore = Array(breaksBeforeCount + 1).join('\n');

	const breaksAfterCount = getBreaksNeededForEmptyLineAfter(
		state1.text,
		state1.selection.end,
	);
	const breaksAfter = Array(breaksAfterCount + 1).join('\n');

	const { modifiedText, insertionLength } = insertBeforeEachLine(
		state1.selectedText,
		insertBefore,
	);
	if (insertionLength < 0) {
		// Remove
		let selectionStart = state1.selection.start;
		let selectionEnd = state1.selection.end;
		if (
			state1.selection.start > 0 &&
			state.text.slice(state1.selection.start - 1, state1.selection.start) ===
				'\n'
		) {
			selectionStart -= 1;
		}
		if (
			state1.selection.end < state.text.length - 1 &&
			state.text.slice(state1.selection.end, state1.selection.end + 1) === '\n'
		) {
			selectionEnd += 1;
		}

		api.setSelectionRange({ start: selectionStart, end: selectionEnd });
		api.replaceSelection(`${modifiedText}`);
		api.setSelectionRange({
			start: selectionStart,
			end: selectionStart + modifiedText.length,
		});
	} else {
		// Add
		api.replaceSelection(`${breaksBefore}${modifiedText}${breaksAfter}`);
		const selectionStart = state1.selection.start + breaksBeforeCount;
		const selectionEnd = selectionStart + modifiedText.length;
		api.setSelectionRange({ start: selectionStart, end: selectionEnd });
	}
};
export const unorderedListCommand: ICommand = {
	name: 'unordered-list',
	keyCommand: 'list',
	shortcuts: 'ctrl+shift+u',
	prefix: '- ',
	render: CommandButton('无序列表', <List />),
	execute: (state: ExecuteState, api: TextAreaTextApi) => {
		makeList(state, api, '- ');
	},
};

export const orderedListCommand: ICommand = {
	name: 'ordered-list',
	keyCommand: 'list',
	shortcuts: 'ctrl+shift+o',
	prefix: '1. ',
	buttonProps: {
		'aria-label': 'Add ordered list (ctrl + shift + o)',
		title: 'Add ordered list (ctrl + shift + o)',
	},
	render: CommandButton('有序列表', <ListOrdered />),
	execute: (state: ExecuteState, api: TextAreaTextApi) => {
		makeList(state, api, (item, index) => `${index + 1}. `);
	},
};

export const checkedListCommand: ICommand = {
	name: 'checked-list',
	keyCommand: 'list',
	shortcuts: 'ctrl+shift+c',
	prefix: '- [ ] ',
	buttonProps: {
		'aria-label': 'Add checked list (ctrl + shift + c)',
		title: 'Add checked list (ctrl + shift + c)',
	},
	render: CommandButton('任务列表', <ListTodo />),

	execute: (state: ExecuteState, api: TextAreaTextApi) => {
		makeList(state, api, (item, index) => `- [ ] `);
	},
};

export const link: ICommand = {
	name: 'link',
	keyCommand: 'link',
	shortcuts: 'ctrlcmd+l',
	prefix: '[',
	suffix: '](url)',
	buttonProps: {
		'aria-label': 'Add a link (ctrl + l)',
		title: 'Add a link (ctrl + l)',
	},
	render: CommandButton('链接', <LinkIcon />),
	execute: (state: ExecuteState, api: TextAreaTextApi) => {
		let newSelectionRange = selectWord({
			text: state.text,
			selection: state.selection,
			prefix: state.command.prefix!,
			suffix: state.command.suffix,
		});
		let state1 = api.setSelectionRange(newSelectionRange);
		if (
			state1.selectedText.includes('http') ||
			state1.selectedText.includes('www')
		) {
			newSelectionRange = selectWord({
				text: state.text,
				selection: state.selection,
				prefix: '[](',
				suffix: ')',
			});
			state1 = api.setSelectionRange(newSelectionRange);
			executeCommand({
				api,
				selectedText: state1.selectedText,
				selection: state.selection,
				prefix: '[](',
				suffix: ')',
			});
		} else {
			if (state1.selectedText.length === 0) {
				executeCommand({
					api,
					selectedText: state1.selectedText,
					selection: state.selection,
					prefix: '[title',
					suffix: '](url)',
				});
			} else {
				executeCommand({
					api,
					selectedText: state1.selectedText,
					selection: state.selection,
					prefix: state.command.prefix!,
					suffix: state.command.suffix,
				});
			}
		}
	},
};

function makeImageCommand(command: ICommand, altText: string, url: string) {
	return {
		...command,
		prefix: '![',
		suffix: `](${url})`,
		execute: (state: ExecuteState, api: TextAreaTextApi) => {
			api.replaceSelection(`![${altText}](${url})\n`);
		},
	};
}
export const image: ICommand = {
	name: 'image',
	keyCommand: 'image',
	shortcuts: 'ctrlcmd+k',
	prefix: '![image](',
	suffix: ')',
	buttonProps: {
		'aria-label': 'Add image (ctrl + k)',
		title: 'Add image (ctrl + k)',
	},
	render: (
		command: ICommand,
		disabled: boolean,
		executeCommand: (command: ICommand<string>, name?: string) => void,
	) => {
		const [open, setOpen] = useState(false);
		const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');
		const [loading, setLoading] = useState(false); //上传中
		const [isSubmitted, setIsSubmitted] = useState(false); //已提交过,优化提示
		const [files, setFiles] = useState<File[]>([]);
		const [errors, setErrors] = useState<{ file?: string }>({});
		const formSchema = z.object({
			altText: z.string().min(1, '请填写描述(替代文字)'),
			url: z.url('请输入有效的链接').optional(),
			file: z.instanceof(File),
		});
		const form = useAppForm({
			defaultValues: { altText: '' } as z.input<typeof formSchema>,
			validators: {
				onChange: formSchema,
			},
			onSubmit: async ({ value }) => {
				if (activeTab === 'link') {
					if (!value.url) return;
					executeCommand(
						makeImageCommand(command, value.altText, value.url),
						command.groupName,
					);
					return;
				} else if (activeTab === 'upload') {
					if (files.length === 0) {
						setErrors({ file: '请选择文件' });
						return;
					}
					setErrors({});
					const url = await uploadSingleFile(files[0], 'project');
					toast.success(`图片上传成功: ${url}`);
					executeCommand(
						makeImageCommand(command, value.altText, url),
						command.groupName,
					);
					// ![11](https://pub-c119a9293e98420d82099567e7ecd825.r2.dev/user/CezzriBRmUpUi3OAipFmUfZ74Y9cvv5r/md/image/30a78488-7120-4b10-b2f4-2306d879a2fd/nixos.png)
					setIsSubmitted(false);
					return true;
				}
			},
		});

		return (
			<Modal
				Trigger={
					<UxTooltip content="插入图片">
						<Button
							// isIconOnly
							disabled={disabled}
							// onClick={onOpen}
							className="bg-transparent"
						>
							<ImageIcon />
						</Button>
					</UxTooltip>
				}
				open={open}
				onOpenChange={setOpen}
				className=""
				title="插入图片"
			>
				<form.AppForm>
					<form.Form onSubmit={form.handleSubmit}>
						<section>
							<form.AppField name="altText">
								{(field) => (
									<field.FieldInput
										title="描述(替代文字)"
										description="请完整描述图片，就像你在向一个看不见图片的人讲解一样"
									/>
								)}
							</form.AppField>
						</section>
						<section>
							<Label>链接</Label>
							<Tabs
								aria-label="Options"
								className="mt-3"
								value={activeTab}
								onValueChange={(key) => setActiveTab(key as 'upload' | 'link')}
							>
								<TabsList>
									<TabsTrigger value="upload">上传</TabsTrigger>
									<TabsTrigger value="link">链接</TabsTrigger>
								</TabsList>
								<TabsContent value="upload">
									<FileDropzone
										setFiles={(files) => {
											setErrors({});
											return setFiles(files);
										}}
										name="file"
									/>
									{files.length > 0 && (
										<Img
											alt="Image"
											className="w-full min-w-90 h-fit  flex items-center justify-center mt-3"
											// classNames={{
											//   wrapper:
											//     'w-full min-w-90 h-fit  flex items-center justify-center mt-3',
											//   img: '!h-fit !relative',
											//   blurredImg: '!h-fit',
											// }}
											// isBlurred
											// height={200}
											src={URL.createObjectURL(files[0])}
											// width={300}
											// layout="constrained"
											// fill
											// objectFit="contain"
										/>
									)}
									{errors.file && (
										<Description className="p-1">{errors.file}</Description>
									)}
								</TabsContent>
								<TabsContent value="link">
									<form.AppField name="url">
										{(field) => <field.FieldInput />}
									</form.AppField>
								</TabsContent>
							</Tabs>
						</section>

						<div className="w-full">
							<Button onClick={() => setOpen(false)}>取消</Button>
							<form.SubmitButton label="插入" />
						</div>
					</form.Form>
				</form.AppForm>
			</Modal>
		);
	},
	execute: (state: ExecuteState, api: TextAreaTextApi) => {
		let newSelectionRange = selectWord({
			text: state.text,
			selection: state.selection,
			prefix: state.command.prefix!,
			suffix: state.command.suffix,
		});
		let state1 = api.setSelectionRange(newSelectionRange);
		if (
			state1.selectedText.includes('http') ||
			state1.selectedText.includes('www')
		) {
			executeCommand({
				api,
				selectedText: state1.selectedText,
				selection: state.selection,
				prefix: state.command.prefix!,
				suffix: state.command.suffix,
			});
		} else {
			newSelectionRange = selectWord({
				text: state.text,
				selection: state.selection,
				prefix: '![',
				suffix: ']()',
			});
			state1 = api.setSelectionRange(newSelectionRange);
			if (state1.selectedText.length === 0) {
				executeCommand({
					api,
					selectedText: state1.selectedText,
					selection: state.selection,
					prefix: '![image',
					suffix: '](url)',
				});
			} else {
				executeCommand({
					api,
					selectedText: state1.selectedText,
					selection: state.selection,
					prefix: '![',
					suffix: ']()',
				});
			}
		}
	},
};
// <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=115264373000245&bvid=BV18mnbziEFw&cid=32624544277&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
export const video: ICommand = {
	name: 'video',
	keyCommand: 'video',
	render: (
		command: ICommand,
		disabled: boolean,
		executeCommand: (command: ICommand<string>, name?: string) => void,
	) => {
		const [open, setOpen] = useState(false);
		const [isSubmitted, setIsSubmitted] = useState(false); //已提交过,优化提示
		const form = useAppForm({
			defaultValues: { url: '' },
			onSubmit: async ({ value }) => {},
		});

		return (
			<Modal
				Trigger={
					<UxTooltip content="插入视频">
						<Button
							// isIconOnly
							disabled={disabled}
							// onClick={onOpen}
							className="bg-transparent"
						>
							<ImageIcon />
						</Button>
					</UxTooltip>
				}
				open={open}
				onOpenChange={setOpen}
				className=""
				title="插入视频"
				// classNames={{
				// 	wrapper: "ml-60",
				// }}
			>
				<form.AppForm>
					<form.Form onSubmit={form.handleSubmit}>
						<section>
							<form.AppField name="url">
								{(field) => <field.FieldInput title="视频链接" />}
							</form.AppField>
						</section>
						<section></section>
						<div className="w-full">
							<Button onClick={() => setOpen(false)}>取消</Button>

							<form.SubmitButton label="插入" />
						</div>
					</form.Form>
				</form.AppForm>
			</Modal>
		);
	},
};
