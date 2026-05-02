/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: 已 rehype-sanitize */
// import dynamic from 'next/dynamic'
// const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
// 1. 使用原生 React.lazy 導入
const MDEditor = React.lazy(() => import('@uiw/react-md-editor'));

import rehypeKatex from 'rehype-katex';
// Support for Github Alerts
// import rehypeSanitize from "rehype-sanitize";
// import { getCodeString } from 'rehype-rewrite';
// import katex from 'katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.css';
import { commands } from '@uiw/react-md-editor';
import React from 'react';
// import styles from './styles.module.css';
import {
	bold,
	checkedListCommand,
	codeBlock,
	details,
	image,
	italic,
	link,
	orderedListCommand,
	quote,
	strikethrough,
	title1,
	title2,
	title3,
	unorderedListCommand,
	video,
} from './Toolbars';

// import remarkAlert from "remark-github-blockquote-alert";
// import { rehypeSanitizeSchema } from './preview/MarkdownPreview';

interface MarkdownEditorProps {
	value: string;
	onChange: (value?: string) => void;
}
export default function MarkdownEditor({
	value,
	onChange,
}: MarkdownEditorProps) {
	return (
		<section className="md">
			<MDEditor
				value={value}
				onChange={onChange}
				height="100%"
				// visibleDragbar
				autoFocus
				minHeight={252}
				preview="edit" // 实时渲染
				textareaProps={{
					placeholder: '请输入详情内容',
				}}
				previewOptions={{
					className: 'h-fit',
					// preview: MarkdownPreview,
					remarkPlugins: [
						// [remarkAlert],
						[remarkMath],
					],
					rehypePlugins: [
						// [rehypeSanitize, rehypeSanitizeSchema],
						[rehypeKatex],
					],
					components: {
						// code: ({ children = [], className, ...props }) => {
						//   const code = props.node && props.node.children ? getCodeString(props.node.children) : children;
						//   // // 行内公式: $formula$
						//   // if (typeof children === 'string' && /^\$(.*)\$/.test(children)) {
						//   //   const html = katex.renderToString(children.replace(/^\$(.*)\$/, '$1'), {
						//   //     throwOnError: false,
						//   //     displayMode: false,
						//   //   });
						//   //   return <code dangerouslySetInnerHTML={{ __html: html }} style={{ background: 'transparent' }} />;
						//   // }
						//   // 块级公式: ```math 或 ```katex
						//   if (
						//     typeof code === 'string' &&
						//     typeof className === 'string' &&
						//     /^language-(math|katex)/.test(className.toLocaleLowerCase())
						//   ) {
						//     const html = katex.renderToString(code, {
						//       throwOnError: false,
						//       displayMode: true, // 块级公式使用displayMode
						//     });
						//     return <code style={{ fontSize: '150%' }} dangerouslySetInnerHTML={{ __html: html }} />;
						//   }
						//   return <code className={String(className)}>{children}</code>;
						// },
					},
				}}
				commands={[
					title1,
					title2,
					title3,
					commands.divider,
					bold,
					italic,
					strikethrough,
					quote,
					codeBlock,
					details,
					commands.divider,
					unorderedListCommand,
					orderedListCommand,
					checkedListCommand,
					commands.divider,
					link,
					image,
					// video
				]}
			/>
		</section>
	);
}
