'use client';

// import { transformerNotationDiff, transformerNotationFocus } from "@shikijs/transformers";
import { Check, Copy, FileIcon } from 'lucide-react';
import { type JSX, useEffect, useMemo, useState } from 'react';
import type { BundledLanguage } from 'shiki/bundle/web';
import { useTheme } from '#/components/app/theme-provider';
import { Button } from '#/components/ui/button';
import { scrollbarDefault } from '#/css';
import { cn } from '#/lib/utils';
import { highlight } from './shared';

export default function CodeBlock({
	code,
	language,
	filename,
	className,
}: {
	code: string;
	language: BundledLanguage;
	filename?: string;
	className?: string;
}) {
	const { theme } = useTheme();
	const [highlighted, setHighlighted] = useState('');
	const [nodes, setNodes] = useState<JSX.Element>();
	const [pending, setPending] = useState(true);
	const [isCopied, setIsCopied] = useState(false); // 新增：复制状态
	// 新增：复制函数
	const copyCode = async () => {
		try {
			await navigator.clipboard.writeText(code); // 复制原始 code (纯文本)
			setIsCopied(true);
			// toast.success("代码已复制！");
			setTimeout(() => setIsCopied(false), 2000); // 2s 后重置
		} catch (err) {
			// toast.error("复制失败，请手动复制");
			console.error('Copy failed:', err);
		}
	};

	const selectedTheme = useMemo(() => {
		return theme === 'light' ? 'catppuccin-latte' : 'catppuccin-macchiato';
	}, [theme]);

	useEffect(() => {
		async function highlightCode() {
			try {
				// const { codeToHtml } = await import('shiki');
				// // const { transformerNotationHighlight } = await import("@shikijs/transformers");
				// const preString = await codeToHtml(code, {
				// 	lang: language,
				// 	theme: selectedTheme,
				// 	// transformers: [
				// 	//   transformerNotationHighlight({ matchAlgorithm: "v3" }), // 高亮指定行
				// 	//   transformerNotationDiff({ matchAlgorithm: "v3" }), // 显示 diff 效果（绿色新增 / 红色删除）
				// 	//   transformerNotationFocus({ matchAlgorithm: "v3" }),// 聚焦某几行、其他行模糊
				// 	// ],
				// });
				// setHighlighted(preString);
				const nodes = await highlight(code, language, selectedTheme);
				console.log(language, selectedTheme);
				setNodes(nodes);
				setPending(false);
			} catch (error) {
				console.error('Error highlighting code:', error);
				setHighlighted(`<pre>${code}</pre>`);
			}
		}
		highlightCode();
	}, [code, language, selectedTheme]);

	const renderCode = (code: string) => {
		if (!pending) {
			return (
				<div className="relative group h-full max-h-full min-h-0">
					<div
						style={{ '--highlight-color': '#ff3333' } as React.CSSProperties}
						className={cn(
							' min-h-0 h-full w-full overflow-auto font-mono text-xs',
							'[&>pre]:h-full [&>pre]:bg-ctp-crust! [&>pre]:py-2', // [&>pre]:w-screen!
							scrollbarDefault,
							'[&>pre>code]:inline-block! [&>pre>code]:w-full!',
							'[&>pre>code>span]:inline-block! [&>pre>code>span]:w-full [&>pre>code>span]:px-4 [&>pre>code>span]:py-0.5',
							'[&>pre>code>.highlighted]:inline-block [&>pre>code>.highlighted]:w-full [&>pre>code>.highlighted]:bg-(--highlight-color)!',
							'group-hover/left:[&>pre>code>:not(.focused)]:opacity-100! group-hover/left:[&>pre>code>:not(.focused)]:blur-none!',
							'group-hover/right:[&>pre>code>:not(.focused)]:opacity-100! group-hover/right:[&>pre>code>:not(.focused)]:blur-none!',
							'[&>pre>code>.add]:bg-[rgba(16,185,129,.16)] [&>pre>code>.remove]:bg-[rgba(244,63,94,.16)]',
							'group-hover/left:[&>pre>code>:not(.focused)]:transition-all group-hover/left:[&>pre>code>:not(.focused)]:duration-300',
							'group-hover/right:[&>pre>code>:not(.focused)]:transition-all group-hover/right:[&>pre>code>:not(.focused)]:duration-300',
						)}
						// dangerouslySetInnerHTML={{ __html: highlighted }}
						children={nodes}
					/>
					<Button
						variant="ghost"
						size="sm"
						onClick={copyCode}
						className="absolute  top-1.5 right-1.5 z-10 p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
						title={isCopied ? '已复制' : '复制'}
					>
						{isCopied ? (
							<Check className="text-primary" />
						) : (
							<Copy className="" />
						)}
					</Button>
				</div>
			);
		} else {
			return (
				<pre className="bg-background text-foreground h-full overflow-auto p-4 font-mono text-xs break-all">
					{code}
				</pre>
			);
		}
	};

	return (
		<div
			data-slot="CodeBlock"
			className={cn(
				`rounded-md overflow-hidden bg-ctp-crust min-w-0 max-w-full  h-fit`,
				className,
			)}
		>
			{filename && (
				<div className="border-primary/20 bg-accent text-foreground  border-b p-2 text-sm">
					<FileIcon className="mr-2 h-4 w-4" />
					{filename}
				</div>
			)}
			{renderCode(code)}
			{/* <div
        className={cn(
          " border-primary/20 md:border-r",
          hasFocus &&
            "[&>div>pre>code>:not(.focused)]:opacity-50! [&>div>pre>code>:not(.focused)]:blur-[0.095rem]!",
          "[&>div>pre>code>:not(.focused)]:transition-all [&>div>pre>code>:not(.focused)]:duration-300",
        )}
      >

      </div> */}
			{/* <div className="group border-border  w-full overflow-hidden  border">

      </div> */}
		</div>
	);
}

// [PLUGIN_TIMINGS] Warning: Your build spent significant time in plugins. Here is a breakdown:
// - replace (87%)
// - @tanstack/devtools:remove-devtools-on-build (10%)
