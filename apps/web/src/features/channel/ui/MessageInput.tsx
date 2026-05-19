// import { Form, Send } from 'lucide-react';
// import { useEffect, useRef, useState } from 'react';
// import { z } from 'zod';
// import { InputGroup } from '#/components/ui/input-group';
// import { useAppForm } from '#/components/uix/form/useAppForm.tsx';
// import { Loading } from '#/components/uix/loading.tsx';
// import type { TextEditorRef } from '#/components/uix/prosemirror/BaseEditor.tsx';
// import { MessageEditor } from '#/components/uix/prosemirror/MessageEditor.tsx';
// import { TextPreview } from '#/components/uix/prosemirror/preview.tsx';
// import {
// 	findBlobUrls,
// 	isEmptyContent,
// 	jsonToMd,
// 	replaceUrlsInContent,
// } from '#/components/uix/prosemirror/utils.tsx';
// import { sendMessageSchema } from '#/features/channel/message.schema.ts';
// import {
// 	type MessageRow,
// 	type MessageWithUser,
// 	messageCollect,
// 	messageOpt,
// } from '#/features/channel/message.sync.ts';
// import type { AuthSession } from '#/lib/auth/config.ts';
// import { useFileUpload } from '#/lib/upload/useFileUpload.ts';
// import { getLocalStorage } from '#/lib/utils/client.ts';

// type MessageInputProps = {
// 	session?: AuthSession | null;
// 	target: { type: 'channel'; id: string } | { type: 'room'; id: string } | null;
// };

// export const MessageInput = ({ session, target }: MessageInputProps) => {
// 	const editorRef = useRef<TextEditorRef>(null);
// 	const formSchema = sendMessageSchema
// 		.safeExtend({
// 			content: z.any().nullish(),
// 		})
// 		.refine(
// 			(data) => {
// 				const hasContent = !isEmptyContent(data.content);
// 				const hasAttachments =
// 					Array.isArray(data.attachments) && data.attachments.length > 0;
// 				return hasContent || hasAttachments;
// 			},
// 			{
// 				message: '消息内容和附件不能同时为空',
// 			},
// 		);
// 	type FormValues = z.input<typeof formSchema>;
// 	const defaultValue: FormValues = {
// 		channel_id: target?.type === 'channel' ? target?.id : null,
// 		room_id: target?.type === 'room' ? target?.id : null,
// 	};
// 	const defaultValues = getLocalStorage('MessageInput', defaultValue);
// 	const { uploadFilesAllowPartial, state } = useFileUpload('message');
// 	const form = useAppForm({
// 		formId: 'MessageInput',
// 		defaultValues,
// 		validators: {
// 			onChange: formSchema,
// 		},
// 		onSubmit: async ({ value, formApi }) => {
// 			if (!target || !session) return;
// 			const cache = editorRef.current?.getFileCache();
// 			if (!cache) throw new Error('没有文件缓存实例, 请重试');
// 			// 1. 找出真正存在文于本内容中的 blobUrls 和对应的 Files
// 			const blobUrls = findBlobUrls(value.content);
// 			console.log('blobUrls', blobUrls);
// 			if (blobUrls.length > 0) {
// 				const files = blobUrls.map((url) => {
// 					const file = cache.get(url);
// 					if (!file) {
// 						console.warn(`找不到对应的文件: ${url}`);
// 						throw new Error(`找不到对应的文件: ${url}`);
// 					}
// 					return file;
// 				});
// 				console.log('正在批量上传图片...', { blobUrls, files });
// 				const uploadedResults = await uploadFilesAllowPartial(files);
// 				//遍历结果，替换本地结果
// 				//注意：uploadFiles 返回的顺序通常与传入的 files 顺序一致
// 				let hasUploadError = false;
// 				uploadedResults?.forEach((r, index) => {
// 					if (r.status === 'rejected') {
// 						console.warn(`上传文件失败: ${r.reason}`);
// 						hasUploadError = true;
// 						return;
// 					}
// 					const localUrl = blobUrls[index];
// 					const remoteUrl = `key://${r.value.storageKey}`; // 替換成實際的遠程 URL，可能需要根據你的後端返回值調整
// 					// 全局替換 JSON 字符串中的本地鏈接
// 					value.content = replaceUrlsInContent(
// 						value.content,
// 						localUrl,
// 						remoteUrl,
// 					);
// 					// 釋放內存
// 					URL.revokeObjectURL(localUrl);
// 					cache?.delete(localUrl);
// 				});
// 				if (hasUploadError)
// 					throw new Error(state.error || '存在上传失败的文件');
// 			}
// 			value.content = jsonToMd(value.content);
// 			const tx = messageCollect.insert({
// 				...value,
// 				user_id: session?.user?.id || null,
// 				sender_name: session?.user?.displayUsername || session?.user?.username,
// 				sender_avatar: session?.user?.image || null,
// 				reply_to_id: null,
// 			});
// 			formApi.reset(defaultValues);
// 			editorRef.current?.clear();
// 			localStorage.removeItem('MessageInput');
// 		},
// 	});

// 	return (
// 		<form.AppForm>
// 			<form.SyncToLocalStorage />
// 			<form.Form className=" m-2 flex gap-2" onSubmit={form.handleSubmit}>
// 				<form.AppField name="content">
// 					{(field) => (
// 						<InputGroup className="h-fit">
// 							<MessageEditor
// 								ref={editorRef}
// 								initialValue={defaultValues.content}
// 								onSave={field.handleChange}
// 								onKeydown={(v, e) => {
// 									if (
// 										e.key === 'Enter' &&
// 										!e.shiftKey &&
// 										!e.ctrlKey &&
// 										!e.altKey &&
// 										!e.metaKey
// 									) {
// 										console.log('Enter pressed', e.key);
// 										e.preventDefault();
// 										form.handleSubmit();
// 									}
// 								}}
// 								className="flex-1 bg-input/50 py-3 px-3.25 prose dark:prose-invert prose-neutral rounded-md"
// 							/>
// 							{/* <InputGroupAddon align="inline-end"> */}
// 							<form.SubmitButton
// 								label=""
// 								icon={<Send className="size-5" />}
// 								className="ml-auto mt-auto mr-1.25 mb-1.25 size-8"
// 								size="sm"
// 							/>
// 							{/* </InputGroupAddon> */}
// 						</InputGroup>
// 					)}
// 				</form.AppField>
// 			</form.Form>
// 		</form.AppForm>
// 	);
// };
