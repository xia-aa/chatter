'use client';

import { Loader2, MessageSquare, SquarePen, SquarePenIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import z from 'zod';
import { Field, FieldError, FieldLabel } from '#/components/ui/field';
import { useAppForm } from '#/components/uix/form/useAppForm';
import { Button } from '../../ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '../../ui/dialog';

type InputModalProps = {
	isOpen: boolean;
	onClose: () => void;
	title: ReactNode;
	placeholder?: string;
	onSubmit?: (value: string) => void | Promise<void>;
	defaultValue?: string;
	inputSchema?: z.ZodString;
	confirmText?: string;
	cancelText?: string;
};

export function InputModal({
	isOpen,
	onClose,
	title,
	placeholder = '请输入...',
	onSubmit,
	defaultValue = '',
	inputSchema = z.string(),
	confirmText = '确定',
	cancelText = '取消',
}: InputModalProps) {
	const formSchema = z.object({
		value: inputSchema,
	});
	const form = useAppForm({
		defaultValues: {
			value: defaultValue,
		} as z.input<typeof formSchema>,
		validators: {
			onChange: formSchema,
		},
		onSubmit: async ({ value }) => {
			if (!onSubmit) return;
			await onSubmit(value.value);
			onClose();
		},
	});

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			form.handleSubmit();
		} else if (e.key === 'Escape') {
			onClose();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<SquarePenIcon className="w-5 h-5 text-blue-500" />
						{title}
					</DialogTitle>
				</DialogHeader>
				<form.AppForm>
					<form.Form className="space-y-4" onSubmit={form.handleSubmit}>
						<form.AppField name="value">
							{(field) => <field.FieldInput onKeyDown={handleKeyDown} />}
						</form.AppField>

						<Field orientation="horizontal">
							<Button
								variant="secondary"
								onClick={onClose}
								disabled={form.state.isSubmitting}
							>
								{cancelText}
							</Button>
							<form.SubmitButton label={confirmText} />
						</Field>
					</form.Form>
				</form.AppForm>
			</DialogContent>
		</Dialog>
	);
}
