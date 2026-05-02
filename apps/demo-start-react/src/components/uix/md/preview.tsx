'use client';
import MarkdownPreview from '@uiw/react-markdown-preview';
// import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { useTheme } from '#/components/app/theme-provider';

// 扩展 schema，让自定义属性不过滤掉
// export const rehypeSanitizeSchema = {
// 	...defaultSchema,
// 	attributes: {
// 		...defaultSchema.attributes,
// 		blockquote: [
// 			...(defaultSchema.attributes?.blockquote || []),
// 			['data-type'], // 允许 blockquote 上的 data-type
// 			['class', 'markdown-alert', /^markdown-alert-./], // 允许 class
// 			['className'],
// 		],
// 		div: [
// 			...(defaultSchema.attributes?.div || []),
// 			['class', 'markdown-alert', /^markdown-alert-./], // 允许 alert class
// 			['className'],
// 		],
// 		p: [
// 			...(defaultSchema.attributes?.p || []),
// 			['class', 'markdown-alert-title'], // 允许 alert class
// 			['className'],
// 		],
// 		code: [
// 			['className', /^language-./, 'math-inline', 'math-display'],
// 			['class', /^language-./, 'math-inline', 'math-display'],
// 		],
// 	},
// };

// Support for Github Alerts
export default function MDPreview({ source }: { source: string }) {
	const { theme, systemTheme } = useTheme();
	return (
		<MarkdownPreview
			source={source}
			// rehypePlugins={[[rehypeSanitize, rehypeSanitizeSchema]]}
			wrapperElement={{
				'data-color-mode': theme === 'system' ? systemTheme : theme,
			}}
		/>
	);
}
