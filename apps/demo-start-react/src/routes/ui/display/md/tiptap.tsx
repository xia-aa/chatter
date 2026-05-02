import { createFileRoute } from '@tanstack/react-router';
import { useFileUpload } from '#/lib/upload/useFileUpload.ts';

export const Route = createFileRoute('/ui/display/md/tiptap')({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/ui/display/md/tiptap"!</div>;
}

import Image from '@tiptap/extension-image';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useRef } from 'react';
import { Markdown } from 'tiptap-markdown';

// bun add @tiptap/react @tiptap/starter-kit @tiptap/extension-image tiptap-markdown

// const MyEditor = () => {
// 	// 用来存储本地链接和文件对象的对应关系 { 'blob:xxx': File }
// 	const fileCache = useRef(new Map());

// 	const editor = useEditor({
// 		extensions: [
// 			StarterKit,
// 			Image,
// 			Markdown, // 确保能导出 MD
// 		],
// 		editorProps: {
// 			handlePaste: (view, event) => {
// 				const items = event.clipboardData?.items;
// 				if (!items) return false;

// 				for (const item of items) {
// 					if (item.type.startsWith('image')) {
// 						const file = item.getAsFile();
// 						const localUrl = URL.createObjectURL(file); // 创建本地预览 URL

// 						// 存入缓存，提交时用
// 						fileCache.current.set(localUrl, file);

// 						// 插入图片节点
// 						view.dispatch(
// 							view.state.tr.replaceSelectionWith(
// 								view.state.schema.nodes.image.create({ src: localUrl }),
// 							),
// 						);
// 						return true;
// 					}
// 				}
// 				return false;
// 			},
// 		},
// 	});
// 	const { uploadFiles } = useFileUpload();
// 	const handleSubmit = async () => {
// 		if (!editor) return;

// 		// 1. 获取当前的 Markdown (此时图片链接还是 blob:xxx)
// 		let finalMarkdown = editor.storage.characterCount.getMarkdown();

// 		// 2. 找出所有需要上传的本地链接
// 		const localUrls = Array.from(fileCache.current.keys());

// 		// 3. 循环上传
// 		for (const localUrl of localUrls) {
// 			if (finalMarkdown.includes(localUrl)) {
// 				const file = fileCache.current.get(localUrl);

// 				// 执行真实的上传 API
// 				// const remoteUrl = await uploadToServer(file);

// 				// 4. 全局替换 Markdown 中的链接
// 				finalMarkdown = finalMarkdown.split(localUrl).join(remoteUrl);

// 				// 5. (可选) 清理内存
// 				URL.revokeObjectURL(localUrl);
// 			}
// 		}

// 		console.log('最终提交的 MD:', finalMarkdown);
// 		// postToApi(finalMarkdown);
// 	};
// };
