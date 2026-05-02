// components/MessageContent.tsx

import type { Json } from 'drizzle-zod';
import { DOMSerializer, Node } from 'prosemirror-model';
import { useMemo } from 'react';
import { jsonToHtml } from '#/components/uix/prosemirror/utils.tsx';

export function TextPreview({
	docJson,
	className = 'p-3 prose dark:prose-invert prose-neutral',
}: {
	docJson?: Json;
	className?: string;
}) {
	const html = useMemo(() => jsonToHtml(docJson), [docJson]);

	// 注意：这里用 dangerouslySetInnerHTML，但数据来自你自己的 ProseMirror schema
	// 只要 schema 的 toDOM 不输出危险属性，就是安全的
	return (
		<div
			className={`relative max-w-none ${className}`}
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
