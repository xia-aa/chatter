import { queryOnce, useLiveInfiniteQuery } from '@tanstack/react-db';
import { ClientOnly, createFileRoute } from '@tanstack/react-router';
import { Check, HistoryIcon, PlusIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useIntersectionObserver } from 'usehooks-ts';
import type { z } from 'zod';
import { Button } from '#/components/ui/button.tsx';
import { useAppForm } from '#/components/uix/form/useAppForm.tsx';
import { Description } from '#/components/uix/label.tsx';
import {
	findBlobUrls,
	replaceUrlsInContent,
	TextEditor,
	type TextEditorRef,
} from '#/components/uix/prosemirror/editor.tsx';
import { TextPreview } from '#/components/uix/prosemirror/preview.tsx';
import { type TodoRow, todoCollect } from '#/features/todo/todo.collect.ts';
import { addTodoZ, type Todo } from '#/features/todo/todo.schema.ts';
import { authClient } from '#/lib/auth/auth-client.ts';
import { useFileUpload } from '#/lib/upload/useFileUpload.ts';
import { formatToNow } from '#/lib/utils.timeFormat.ts';

export const Route = createFileRoute('/demo/todo')({
	loader: async () => {
		await queryOnce((q) =>
			q
				.from({ todo: todoCollect })
				.orderBy(({ todo }) => todo.updated_at, 'desc')
				.orderBy(({ todo }) => todo.id, 'desc')
				.limit(10),
		);

		return null;
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<ClientOnly fallback={<TodoListFallback />}>
				<TodoListClient />
			</ClientOnly>
		</div>
	);
}

function TodoListClient() {
	const { ref: sentinelRef, isIntersecting } = useIntersectionObserver({
		threshold: 0,
		rootMargin: '300px 0px',
	});
	const {
		data: todos,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useLiveInfiniteQuery(
		(q) =>
			q
				.from({ todo: todoCollect })
				.orderBy(({ todo }) => todo.updated_at, 'desc')
				.orderBy(({ todo }) => todo.id, 'desc'),
		{ pageSize: 10 },
	);
	console.log({
		isDate: todos?.[0]?.updated_at instanceof Date,
		length: todos?.length,
	});
	useEffect(() => {
		if (!isIntersecting) return;
		if (!hasNextPage || isFetchingNextPage) return;
		void fetchNextPage();
	}, [fetchNextPage, hasNextPage, isFetchingNextPage, isIntersecting]);

	return (
		<div className="p-2 flex flex-col gap-2">
			<AddTodoCard />
			{todos?.map((todo) => (
				<TodoCard key={todo.id} todo={todo} />
			))}
			<div ref={sentinelRef} className="h-1" />
			{isFetchingNextPage ? (
				<div className="text-sm text-muted-foreground">Loading more...</div>
			) : null}
			{!hasNextPage ? (
				<div className="text-sm text-muted-foreground">No more todos</div>
			) : null}
		</div>
	);
}

function TodoListFallback() {
	return <div>Loading todos...</div>;
}

function TodoCard({ todo }: { todo: TodoRow }) {
	return (
		<div
			className={`bg-muted p-2 rounded-md  ${!todo.$synced && 'animate-pulse'}`}
		>
			<div className="flex justify-between items-center">
				<div className="flex items-center gap-2">
					<button
						onClick={() =>
							todoCollect.update(todo.id, (draft) => {
								console.log('UpdatingTodo.draft', draft);
								draft.completed = !todo.completed;
								draft.created_at = new Date(draft.created_at!);
								draft.updated_at = new Date();
							})
						}
						className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
							todo.completed
								? 'bg-green-500 border-green-500 text-white'
								: 'border-green-300 hover:border-green-400 text-transparent hover:text-green-400'
						}`}
					>
						<Check size={14} />
					</button>
					<h3>{todo.title}</h3>
					<span>{todo.id}</span>
				</div>
				<Button
					size={'sm'}
					variant={'destructive'}
					onClick={() => todoCollect.delete(todo.id)}
				>
					Delete
				</Button>
			</div>
			{/* {todo.content} */}
			<TextPreview docJson={todo.content} />
			<Description className="flex items-center gap-1">
				<HistoryIcon size={16} /> {formatToNow(todo.updated_at)}
			</Description>
		</div>
	);
}
function AddTodoCard() {
	const { data: session } = authClient.useSession();
	type FormValues = z.input<typeof addTodoZ>;
	const [formKey, setFormKey] = useState(0);
	const initialValuesRef = useRef<FormValues | null>(null);
	if (initialValuesRef.current === null) {
		try {
			const raw = localStorage.getItem('AddTodoCard');
			initialValuesRef.current = raw
				? (JSON.parse(raw) as FormValues)
				: ({} as FormValues);
		} catch {
			initialValuesRef.current = {} as FormValues;
		}
	}
	const { uploadFiles, state } = useFileUpload();
	const form = useAppForm({
		formId: 'AddTodoCard',
		defaultValues: initialValuesRef.current,
		validators: {
			onChange: addTodoZ,
		},
		onSubmit: async ({ value, formApi, meta }) => {
			if (!session) throw new Error('请先登录');
			// 通过 ref 拿到內部的 Map
			const cache = editorRef.current?.getFileCache();
			if (!cache) throw new Error('没有文件缓存实例, 请重试');
			// 1. 找出真正存在於文檔中的 blobUrls 和對應的 Files
			const blobUrls = findBlobUrls(value.content);
			console.log('blobUrls', blobUrls);
			if (blobUrls.length > 0) {
				const files = blobUrls.map((url) => {
					const file = cache.get(url);
					if (!file) {
						console.warn(`找不到对应的文件: ${url}`);
						throw new Error(`找不到对应的文件: ${url}`);
					}
					return file;
				});
				console.log('正在批量上传图片...', { blobUrls, files });
				const uploadedResults = await uploadFiles(files);
				//遍历结果，替换本地结果
				//注意：uploadFiles 返回的顺序通常与传入的 files 顺序一致
				let hasUploadError = false;
				uploadedResults?.forEach((r, index) => {
					if (r.status === 'rejected') {
						console.warn(`上传文件失败: ${r.reason}`);
						hasUploadError = true;
						return;
					}
					const localUrl = blobUrls[index];
					const remoteUrl = `key://${r.value.storageKey}`; // 替換成實際的遠程 URL，可能需要根據你的後端返回值調整
					// 全局替換 JSON 字符串中的本地鏈接
					value.content = replaceUrlsInContent(
						value.content,
						localUrl,
						remoteUrl,
					);
					// 釋放內存
					URL.revokeObjectURL(localUrl);
					cache?.delete(localUrl);
				});
				if (hasUploadError)
					throw new Error(state.error || '存在上传失败的文件');
			}

			const tx = todoCollect.insert({ ...value, user_id: session?.user.id });
			await tx.isPersisted.promise;
			formApi.reset();
			formApi.setFieldValue('title', undefined);
			formApi.setFieldValue('content', undefined);
			setFormKey((prev) => prev + 1);
			localStorage.removeItem('AddTodoCard');
		},
	});
	const editorRef = useRef<TextEditorRef>(null);
	return (
		<form.AppForm key={formKey}>
			<form.Form
				onSubmit={form.handleSubmit}
				className="flex flex-col gap-3 bg-card rounded-md p-2"
			>
				<form.SyncToLocalStorage />
				<div className="flex gap-2 items-center">
					<form.AppField name="title">
						{(field) => <field.FieldInput placeholder="Title" />}
					</form.AppField>
					<form.SubmitButton
						label="Add"
						canSubmitDefault
						icon={<PlusIcon size={20} />}
					/>
				</div>
				<form.AppField name="content">
					{(field) => (
						<TextEditor
							ref={editorRef}
							initialValue={field.state.value}
							onSave={field.handleChange}
							onKeydown={(v, e) => {
								if (
									e.key === 'Enter' &&
									!e.shiftKey &&
									!e.ctrlKey &&
									!e.altKey &&
									!e.metaKey
								) {
									console.log('Enter pressed', e.key);
									e.preventDefault();
									form.handleSubmit();
								}
							}}
							className="bg-input/50 py-2 px-3 prose dark:prose-invert prose-neutral rounded-md"
						/>
					)}
				</form.AppField>

				<Button onClick={() => localStorage.removeItem('AddTodoCard')}>
					清除缓存
				</Button>
			</form.Form>
		</form.AppForm>
	);
}
