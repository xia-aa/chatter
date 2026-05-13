import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useAppForm } from '#/components/uix/form/useAppForm.tsx';

export const Route = createFileRoute('/demo/form/')({
	component: RouteComponent,
});

const formSchema = z.object({
	name: z.string().min(1, '请输入姓名'),
});

type FormValues = z.input<typeof formSchema>;

function getInitialValues(): FormValues {
	try {
		const raw = localStorage.getItem('DemoForm');
		if (!raw) return { name: '' };
		const parsed = JSON.parse(raw) as FormValues;
		return parsed.name ? parsed : { name: '' };
	} catch {
		return { name: '' };
	}
}

function RouteComponent() {
	const [syncEnabled, setSyncEnabled] = useState(true);
	const form = useAppForm({
		formId: 'DemoForm',
		defaultValues: { name: '' },
		validators: {
			onChange: formSchema,
		},
		onSubmit: async ({ value }) => {
			alert(`提交成功! 姓名: ${value.name}`);
			handleClear();
		},
	});

	// 从 localStorage 恢复值（仅挂载时）
	useEffect(() => {
		try {
			const raw = localStorage.getItem('DemoForm');
			if (raw) {
				const parsed = JSON.parse(raw) as FormValues;
				if (parsed.name) {
					form.setFieldValue('name', parsed.name);
				}
			}
		} catch {
			// ignore
		}
	}, [form]);

	const handleClear = () => {
		setSyncEnabled(false);
		form.reset({ name: '' });
		localStorage.removeItem('DemoForm');
		// 重新启用同步，以便下次修改时正常保存
		setTimeout(() => setSyncEnabled(true), 0);
	};

	return (
		<div className="max-w-md mx-auto p-4">
			<h1 className="text-xl font-bold mb-2">表单本地存储演示</h1>
			<p className="text-muted-foreground mb-4 text-sm">
				输入姓名后刷新页面，数据会自动恢复
			</p>

			<form.AppForm>
				<form.Form
					onSubmit={form.handleSubmit}
					className="flex flex-col gap-3 bg-card rounded-lg p-4 border"
				>
					<form.SyncToLocalStorage />

					<form.AppField name="name">
						{(field) => <field.FieldInput placeholder="请输入姓名" />}
					</form.AppField>

					<div className="flex gap-2">
						<form.SubmitButton label="提交" canSubmitDefault />
						<button
							type="button"
							onClick={() => handleClear()}
							className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
						>
							清除缓存
						</button>
					</div>
				</form.Form>
			</form.AppForm>
		</div>
	);
}
