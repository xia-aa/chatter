// 'use client';

// import { useQuery } from '@tanstack/react-query';
// import { getRouteApi, Link } from '@tanstack/react-router';
// import {
// 	Eye,
// 	EyeOff,
// 	Hash,
// 	LockKeyhole,
// 	MailIcon,
// 	Smartphone,
// } from 'lucide-react';
// import { type FormEvent, useEffect, useState } from 'react';
// import { useCountdown } from 'usehooks-ts';
// import z from 'zod';
// import { Button } from '#/components/ui/button';
// import { InputGroupText } from '#/components/ui/input-group';
// import { useAppForm } from '#/components/uix/form/useAppForm';
// import { toast, toastError } from '#/components/uix/toast';
// import { authClient } from '#/lib/auth/auth-client';
// import { IsAgreeTitle } from '#/lib/auth.comp';
// import { authQ } from '#/lib/auth.rq';
// import { OTPSchema, phoneSchema } from '#/lib/auth.schema';

// const formSchema = z.object({
// 	phoneNumber: phoneSchema,
// 	code: OTPSchema,
// 	isAgree: z
// 		.literal(true, { message: '需要同意用户协议与隐私政策' })
// 		.optional(),
// });
// export const PhoneNumberOTPSignIn = () => {
// 	const { useNavigate, useSearch } = getRouteApi('/_main/_auth/sign_in');
// 	const { callbackURL } = useSearch();
// 	const navigate = useNavigate();
// 	const form = useAppForm({
// 		validators: {
// 			onChange: formSchema,
// 		},
// 		defaultValues: {
// 			phoneNumber: '',
// 			code: '',
// 		} as z.infer<typeof formSchema>,
// 		onSubmit: async ({ value }) => {
// 			const { error } = await authClient.phoneNumber.verify({
// 				phoneNumber: `+86${value.phoneNumber}`,
// 				code: value.code,
// 			});
// 			if (error) {
// 				toastError(error);
// 				return;
// 			}
// 			await refetch();
// 			navigate({
// 				to: callbackURL,
// 				search: true,
// 			});
// 		},
// 	});
// 	const { refetch } = useQuery(authQ.session);

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
// 		if (hasErrors) {
// 			// 可选: toast 错误或聚焦字段
// 			// form.setFocus('phoneNumber')
// 			// toast.error("手机号格式无效");
// 			return;
// 		}
// 		resetCountdown();
// 		setSending(true);
// 		startCountdown(); // 启动倒计时
// 		const { data, error } = await authClient.phoneNumber.sendOtp({
// 			phoneNumber: `+86${form.getFieldValue('phoneNumber')}`,
// 		});
// 		if (error) {
// 			toast.error(error);
// 			setSending(false);
// 			return;
// 		}
// 		// toast.success("验证码已发送，请注意查收");
// 	};

// 	return (
// 		<form.AppForm>
// 			<form.Form className="w-full space-y-3" onSubmit={form.handleSubmit}>
// 				{/* <p className="text-muted-foreground text-xs h-4 mt-4">
//         你所在的地区仅支持 手机号 \ 微信 \ 邮箱 登录
//       </p> */}
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
// 						className="w-25 h-9"
// 						type="button"
// 						variant="secondary"
// 						disabled={sending}
// 						onClick={() => onSendPhoneOtp()}
// 					>
// 						{sending ? `${count} 秒后重发` : '发送验证码'}
// 					</Button>
// 				</div>
// 				{/* <FormField
//         name="code"
//         control={control}
//         render={({ field, fieldState }) => (
//           <>
//             <div className="flex gap-2">
//               <InputGroup>
//                 <InputGroupInput
//                   {...field}
//                   aria-invalid={fieldState.invalid}
//                   placeholder="请输入验证码"
//                 />
//                 <InputGroupAddon>
//                   <Hash />
//                 </InputGroupAddon>
//               </InputGroup>
//               <Button
//                 className="w-25"
//                 type="button"
//                 variant="secondary"
//                 disabled={sending}
//                 onClick={() => onSendPhoneOtp()}
//               >
//                 {sending ? `${count} 秒后重发` : '发送验证码'}
//               </Button>
//             </div>
//             <FieldDescription>5分钟内有效, 60秒可重新发送</FieldDescription>
//           </>
//         )}
//       /> */}
// 				<form.AppField name="isAgree">
// 					{(field) => (
// 						<field.FieldCheckbox
// 							label={<IsAgreeTitle />}
// 							description="未注册的手机号将自动注册"
// 						/>
// 					)}
// 				</form.AppField>
// 				<form.SubmitButton className="w-full" label="登录" />
// 				{/* <Controller
//         name="isAgree"
//         control={control}
//         render={({ field, fieldState }) => (
//           <Field data-invalid={fieldState.invalid}>
//             <div className="flex items-start gap-2 text-muted-foreground text-xs h-9">
//               <Checkbox
//                 name={field.name}
//                 checked={field.value}
//                 onCheckedChange={field.onChange}
//                 aria-invalid={fieldState.invalid}
//               />
//               <div className="grid gap-2">
//                 <FieldLabel className="text-xs">
//                   已阅读并同意{' '}
//                   <Link
//                     href={'/legal/terms'}
//                     className="text-accent-foreground underline"
//                   >
//                     用户协议
//                   </Link>{' '}
//                   与{' '}
//                   <Link
//                     href={'/legal/privacy'}
//                     className="text-accent-foreground underline"
//                   >
//                     隐私政策
//                   </Link>
//                 </FieldLabel>
//                 <p className="text-muted-foreground text-xs">未注册的手机号将自动注册</p>
//               </div>
//             </div>
//             {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
//           </Field>
//         )}
//       />
//       <Button pending={formState.isSubmitting} type="submit" className="w-full ">
//         登录
//       </Button> */}
// 			</form.Form>
// 		</form.AppForm>
// 	);
// };
