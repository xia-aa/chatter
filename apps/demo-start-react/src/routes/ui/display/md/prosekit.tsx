import { useAppForm } from '#/components/uix/form/useAppForm.tsx';
import { TextEditor, type TextEditorRef } from '#/components/uix/prosekit/Editor.tsx';
import { getLocalStorage } from '#/lib/utils/client.ts';
import { createFileRoute } from '@tanstack/react-router'
import { SendIcon } from 'lucide-react';
import { useRef } from 'react';
import { z } from 'zod';

export const Route = createFileRoute('/ui/display/md/prosekit')({
  component: RouteComponent,
})

function RouteComponent() {
	const formSchema = z.object({
		description: z.any().nullish(),
	});
  	type FormValues = z.input<typeof formSchema>;
  const data = getLocalStorage('prosekit', { description : ""}) // 触发 localStorage 的读取，提前加载数据
	const defaultValues: FormValues = {
		description: data?.description
	};
  const form = useAppForm({
    formId: "prosekit",
    defaultValues,
		validators: {
			onChange: formSchema
		},
		onSubmit: async ({value })=> {}
  })
	const editorRef = useRef<TextEditorRef>(null);
  return 		<form.AppForm>
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
								onKeydown={form.handleSubmit}
								className="bg-input/50 py-2 px-3 prose dark:prose-invert prose-neutral"
							/>
						)}
					/>
				</div>
								<form.SubmitButton label="Send" icon={<SendIcon />} />
			</form.Form>
		</form.AppForm>
}
