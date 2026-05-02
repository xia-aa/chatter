// import { toast } from 'sonner';
// import { Field } from '#/components/ui/field';
// import { UxAlert } from '#/components/uix/alert';
// import { useAppForm } from '#/components/uix/form/useAppForm';
// import { openModal } from '#/components/uix/modal/renderer';
// import { toastError } from '#/components/uix/toast';
// import { authClient } from '#/lib/auth/auth-client';

// const text = {
// 	p: '账号注销后，您将无法再使用该账号', // 注销前请认真阅读以下重要提醒。账号注销后，您将无法再使用该账号，包括但不限于：
// 	li1: '',
// };
// function DeleteUser({ onSuccess }: { onSuccess?: () => void }) {
// 	const form = useAppForm({
// 		onSubmit: async () => {
// 			const { error } = await authClient.deleteUser();
// 			if (error) {
// 				toastError(error);
// 				return;
// 			}
// 			toast.success('账号已注销');
// 			onSuccess?.();
// 		},
// 	});

// 	return (
// 		<form.AppForm>
// 			<form.Form className="space-y-3" onSubmit={form.handleSubmit}>
// 				<p>{text.p}</p>
// 				{/* <ul className="list-inside list-disc text-sm px-2">
//         <li>Check your card details</li>
//         <li>Ensure sufficient funds</li>
//         <li>Verify billing address</li>
//       </ul> */}
// 				<Field orientation="horizontal" className="justify-end">
// 					<form.SubmitButton className="w-full" label="确定" />
// 				</Field>
// 			</form.Form>
// 		</form.AppForm>
// 	);
// }

// export const openDeleteUserModal = () =>
// 	openModal((close) => <DeleteUser onSuccess={close} />, {
// 		title: <UxAlert variant="destructive" title="确认注销账号" />,
// 		closeOnOverlayClick: false,
// 	});
