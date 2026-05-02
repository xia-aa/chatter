// 'use client';
// import { useQuery } from '@tanstack/react-query';
// import { getRouteApi, Link } from '@tanstack/react-router';
// import { Hash, LockKeyhole, Smartphone, User2 } from 'lucide-react';
// import { useEffect, useState } from 'react';
// import { useCountdown } from 'usehooks-ts'; // 导入
// import z from 'zod';
// import { Button } from '#/components/ui/button';
// import { Checkbox } from '#/components/ui/checkbox';
// import {
// 	Field,
// 	FieldDescription,
// 	FieldError,
// 	FieldLabel,
// } from '#/components/ui/field';
// import {
// 	InputGroup,
// 	InputGroupAddon,
// 	InputGroupInput,
// 	InputGroupText,
// } from '#/components/ui/input-group';
// import { useAppForm } from '#/components/uix/form/useAppForm';
// import { toast, toastError } from '#/components/uix/toast';
// import { authClient } from '#/lib/auth/auth-client';
// import { IsAgreeTitle } from '#/lib/auth.comp';
// import { authQ } from '#/lib/auth.rq';
// import { OTPSchema, phoneSchema } from '#/lib/auth.schema';

// const formSchema = z.object({
// 	phoneNumber: phoneSchema,
// 	// password: passwordSchema,
// 	// // confirmPassword: z.string().min(1, "请确认密码"),
// 	// // email: z.email().optional(),
// 	// displayUsername: z.string().max(32, "不能超过32个字符").optional(),
// 	// username: usernameSchema,
// 	// birthday: z.date(),
// 	code: OTPSchema,
// 	isAgree: z.literal(true, { message: '需要同意用户协议与隐私政策' }),
// });
// // .refine((data) => data.password === data.confirmPassword, {
// //   message: "两次输入的密码不一致",
// //   path: ["confirmPassword"], // 错误信息显示在 confirmPassword 字段上
// // });
// type Data = z.infer<typeof formSchema>;
// export const PhoneNumberSignUp = () => {
// 	const { useNavigate, useSearch } = getRouteApi('/_main/_auth/sign_up');
// 	const { callbackURL } = useSearch();
// 	const navigate = useNavigate();
// 	const form = useAppForm({
// 		validators: {
// 			onChange: formSchema,
// 		},

// 		defaultValues: {
// 			phoneNumber: '',
// 			// password: "",
// 			code: '',
// 			// username: "",
// 			// displayUsername: "",
// 			// isAgree: false,
// 		} as z.infer<typeof formSchema>,
// 		onSubmit: async ({ value }) => {
// 			// const { error } = await verifyPhoneNumber(`+86${fd.phoneNumber}`, fd.code);
// 			const { error } = await authClient.phoneNumber.verify({
// 				phoneNumber: `+86${value.phoneNumber}`, // required
// 				code: value.code, // required
// 				// disableSession: true,
// 				// updatePhoneNumber: false,
// 			});
// 			if (error) {
// 				toastError(error);
// 				return;
// 			}
// 			// const { data, error: err2 } = await authClient.signUp.email({
// 			//   phoneNumber: `+86${fd.phoneNumber}`, // required
// 			//   email: getTempEmail(`+86${fd.phoneNumber}`), // required
// 			//   name: fd.username, // required
// 			//   password: fd.password, // required
// 			//   username: fd.username, // required
// 			//   displayUsername: fd.displayUsername,
// 			// });
// 			// if (err2) {
// 			//   toast.error(err2, "注册错误");
// 			//   return;
// 			// }
// 			await refetch();
// 			navigate({ to: callbackURL, search: true });
// 			// const { data, error } = await authClient.phoneNumber.verify({
// 			//   phoneNumber: `+86${fd.phoneNumber}`,
// 			//   code: fd.code,
// 			// });
// 			// if (error) {
// 			//   toast.error(error);
// 			//   return;
// 			// }
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

// 	const { refetch } = useQuery(authQ.session);

// 	const onSendPhoneOtp = async () => {
// 		if (sending) return; // 避免重复发送
// 		const isValid = await form.validateField('phoneNumber', 'change');
// 		console.log("await form.validateField('phoneNumber', 'change')", isValid);
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

// 				{/* <FormField
//         name="password"
//         label="密码  *"
//         control={control}
//         render={({ field, fieldState }) => (
//           <InputPassword {...field} aria-invalid={fieldState.invalid} />
//         )}
//       /> */}
// 				{/* <FormField
//         name="confirmPassword"
//         control={control}
//         render={({ field, fieldState }) => (
//           <InputPassword
//             {...field}
//             aria-invalid={fieldState.invalid}
//             placeholder="请再次输入密码"
//           />
//         )}
//       /> */}

// 				{/* <FormField
//         name="displayUsername"
//         label="昵称"
//         control={control}
//         render={({ field, fieldState }) => (
//           <InputGroup>
//             <InputGroupInput
//               {...field}
//               aria-invalid={fieldState.invalid}
//               placeholder="请输入昵称"
//             />
//             <InputGroupAddon>
//               <User2 />
//             </InputGroupAddon>
//           </InputGroup>
//         )}
//       />
//       <FormField
//         name="username"
//         label="用户名 *"
//         control={control}
//         render={({ field, fieldState }) => (
//           <InputGroup>
//             <InputGroupInput
//               {...field}
//               required
//               aria-invalid={fieldState.invalid}
//               placeholder="请输入用户名"
//             />
//             <InputGroupAddon>
//               <User2 />
//             </InputGroupAddon>
//           </InputGroup>
//         )}
//       /> */}
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

// 				<form.AppField name="isAgree">
// 					{(field) => (
// 						<field.FieldCheckbox
// 							label={<IsAgreeTitle />}
// 							description="未注册的手机号将自动注册"
// 						/>
// 					)}
// 				</form.AppField>
// 				<form.SubmitButton className="w-full" label="注册" />
// 			</form.Form>
// 		</form.AppForm>
// 	);
// };
