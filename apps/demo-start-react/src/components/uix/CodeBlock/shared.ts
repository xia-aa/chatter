import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import type { JSX } from 'react';
import { Fragment } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';
import type {
	BundledLanguage,
	BundledTheme,
	CodeOptionsSingleTheme,
} from 'shiki/bundle/web';

// import { createHighlighter } from 'shiki/bundle/web';
const { createHighlighter } = await import('shiki/bundle/web');
const highlighter = await createHighlighter({
	langs: ['ts', 'json', 'tsx'], // ❗只留你真的用的
	themes: ['catppuccin-latte', 'catppuccin-macchiato'],
});
export async function highlight(
	code: string,
	lang: BundledLanguage,
	theme: CodeOptionsSingleTheme<BundledTheme>['theme'],
) {
	const out = highlighter.codeToHast(code, {
		lang,
		theme,
	});

	return toJsxRuntime(out, {
		Fragment,
		jsx,
		jsxs,
	}) as JSX.Element;
}
