import { createFileRoute } from '@tanstack/react-router';
import { SendIcon } from 'lucide-react';
import { useRef } from 'react';
import { z } from 'zod';
import { useAppForm } from '#/components/uix/form/useAppForm.tsx';
import {
	TextEditor,
	type TextEditorRef,
} from '#/components/uix/prosekit/Editor.tsx';
import { getLocalStorage } from '#/lib/utils/client.ts';

export const Route = createFileRoute('/ui/display/md/prosekit')({
	component: RouteComponent,
});

function RouteComponent() {
	const editorRef = useRef<TextEditorRef>(null);
	const formSchema = z.object({
		description: z.string().optional(),
	});
	type FormValues = z.input<typeof formSchema>;
	const data = getLocalStorage('prosekit', { description: '' }); // 触发 localStorage 的读取，提前加载数据
	const defaultValues: FormValues = {
		description: data?.description,
	};
	const form = useAppForm({
		formId: 'prosekit',
		defaultValues,
		validators: {
			onChange: formSchema,
		},
		onSubmit: async ({ value }) => {
			console.log('onSubmit', value);
			// 模拟异步操作
			await new Promise((resolve) => setTimeout(resolve, 1000));
		},
	});

	return (
		<form.AppForm>
			<form.SyncToLocalStorage />
			<form.Form onSubmit={form.handleSubmit}>
				<div className="p-4 sm:p-10">
					<form.AppField
						name="description"
						children={(field) => (
							<TextEditor
								ref={editorRef}
								initialValue={defaultValues?.description}
								onSave={field.handleChange}
								// onKeydown={form.handleSubmit}
								className="bg-input/50 py-2 px-3 prose dark:prose-invert prose-neutral"
							/>
						)}
					/>
				</div>
				<form.Subscribe
					selector={(s) => ({ content: s.values.description })}
					children={({ content }) => (
						<textarea className="p-4 h-64" value={content} />
					)}
				/>
				<form.SubmitButton label="Send" icon={<SendIcon />} />
			</form.Form>
		</form.AppForm>
	);
}
