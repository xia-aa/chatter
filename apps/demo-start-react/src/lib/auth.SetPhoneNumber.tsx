// 'use client';

// import {
// 	ChevronRightIcon,
// 	Hash,
// 	Smartphone,
// 	TrashIcon,
// 	UserIcon,
// } from 'lucide-react';
// import { type FormEvent, useCallback, useEffect, useState } from 'react';
// import { toast } from 'sonner';
// import { useCountdown } from 'usehooks-ts';
// import z from 'zod';
// import { Field, FieldDescription, FieldLabel } from '#/components/ui/field';
// import { InputGroupText } from '#/components/ui/input-group';
// import { Button } from '#/components/uix/button';
// import { useAppForm } from '#/components/uix/form/useAppForm';
// import { toastError } from '#/components/uix/toast';
// import { authClient } from '#/lib/auth/auth-client';
// import { OTPSchema, phoneSchema } from '#/lib/auth.schema';

// export function SetPhoneNumberForm({ onSuccess }: { onSuccess?: () => void }) {
// 	const formSchema = z.object({
// 		phoneNumber: phoneSchema,
// 		code: OTPSchema,
// 	});
// 	const form = useAppForm({
// 		validators: {
// 			onChange: formSchema,
// 		},
// 		defaultValues: { phoneNumber: '' } as z.infer<typeof formSchema>,
// 		onSubmit: async ({ value }) => {
// 			const { error } = await authClient.phoneNumber.verify({
// 				phoneNumber: `+86${value.phoneNumber}`,
// 				code: value.code,
// 				updatePhoneNumber: true, // Set to true to update the phone number
// 			});
// 			if (error) {
// 				// if (error?.code === "PHONE_NUMBER_ALREADY_EXISTS") {
// 				//   error.message = "手机号已被其他用户绑定"
// 				// }
// 				return toastError(error, '修改失败');
// 			}
// 			toast.success('修改成功');
// 			// mutateSession();
// 			onSuccess?.();
// 		},
// 	});

// 	// useCountdown 配置：初始 60s，成功发送后启动
// 	const [sending, setSending] = useState(false);
// 	const [count, { startCountdown, stopCountdown, resetCountdown }] =
// 		useCountdown({
// 			countStart: 60,
// 			intervalMs: 1000,
// 		});
// 	useEffect(() => {
// 		if (count === 0) setSending(false);
// 	}, [count]);
// 	const onSendPhoneOtp = async () => {
// 		if (sending) return; // 避免重复发送
// 		const isValid = await form.validateField('phoneNumber', 'change');
// 		console.log("await form.validateField('phoneNumber', 'change')", isValid);
// 		// const isValid = await form.trigger('phoneNumber')
// 		const errLen = form.getFieldMeta('phoneNumber')?.errors.length;
// 		const hasErrors = errLen ? errLen > 0 : false;
// 		if (!isValid) {
// 			// 可选: toast 错误或聚焦字段
// 			// form.setFocus("phoneNumber");
// 			// toastError("手机号格式无效");
// 			return;
// 		}
// 		resetCountdown();
// 		setSending(true);

// 		const { data, error } = await authClient.phoneNumber.sendOtp(
// 			{
// 				phoneNumber: `+86${form.getFieldValue('phoneNumber')}`,
// 			},
// 			{
// 				onRequest(context) {
// 					startCountdown();
// 				},
// 				onResponse(context) {},
// 				onError(context) {
// 					context.response.headers.get('X-Retry-After'); // 单位 s
// 					const retryAfter = context.response.headers.get('X-Retry-After');

// 					toastError(context.error);
// 					setSending(false);
// 				},
// 			},
// 		);
// 		if (error) return;
// 	};

// 	return (
// 		<form.AppForm>
// 			<form.Form className="space-y-3" onSubmit={form.handleSubmit}>
// 				<form.AppField name="phoneNumber">
// 					{(field) => (
// 						<field.FieldInputGroup
// 							placeholder="请输入手机号"
// 							Addon={
// 								<>
// 									<Smartphone />
// 									<InputGroupText>+86</InputGroupText>
// 								</>
// 							}
// 						/>
// 					)}
// 				</form.AppField>
// 				<div className="flex gap-2">
// 					<form.AppField name="code">
// 						{(field) => (
// 							<field.FieldInputGroup
// 								placeholder="请输入验证码"
// 								Addon={<Hash />}
// 								description="5分钟内有效, 60秒可重新发送"
// 							/>
// 						)}
// 					</form.AppField>
// 					<Button
// 						className="w-25"
// 						type="button"
// 						variant="secondary"
// 						disabled={sending}
// 						onClick={() => onSendPhoneOtp()}
// 					>
// 						{sending ? `${count} 秒后重发` : '发送验证码'}
// 					</Button>
// 				</div>
// 				<Field orientation="horizontal" className="justify-end">
// 					<form.SubmitButton className="w-full" label="保存" />
// 				</Field>
// 			</form.Form>
// 		</form.AppForm>
// 	);
// }
