import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { UploadIcon } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useAppForm } from '#/components/uix/form/useAppForm.tsx';
import { uploadFile } from '#/lib/upload/_client.ts';
import { genSignedUploadUrl } from '#/lib/upload/sdk.server.ts';
import {
	fieldFileItemZ,
	genSignedUrlFile,
} from '#/lib/upload/upload.schema.ts';

export const Route = createFileRoute('/base/s3/')({
	component: RouteComponent,
});
const genSignedUrl = createServerFn()
	.inputValidator(genSignedUrlFile)
	.handler(({ data }) => genSignedUploadUrl(data.name, data.type, data.size));
function RouteComponent() {
	const formSchema = z.object({
		files: z.array(fieldFileItemZ).min(1),
	});
	const form = useAppForm({
		defaultValues: {
			files: [],
		} as z.infer<typeof formSchema>,
		validators: {
			onChange: formSchema,
		},
		onSubmit: async ({ value }) => {
			const file = value.files[0];
			if (!file.file) {
				console.error('No file selected');
				return;
			}
			console.log('开始生成预签名URL');
			const signedUrl = await genSignedUrl({
				data: {
					name: file.file.name,
					type: file.file.type,
					size: file.file.size,
				},
			});
			console.log('预签名URL生成完成', signedUrl);
			console.log('开始上传文件');
			await uploadFile(signedUrl, file.file);
			toast.success('File uploaded successfully');
		},
	});
	return (
		<form.AppForm>
			<form.Form onSubmit={form.handleSubmit}>
				<form.AppField
					name="files"
					children={(field) => <field.FieldXFileInput />}
				/>
				<form.SubmitButton label="Upload" icon={<UploadIcon />} />
			</form.Form>
		</form.AppForm>
	);
}
