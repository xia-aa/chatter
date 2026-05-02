'use client';

import { useLiveQuery } from '@tanstack/react-db';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { PlusIcon, SendIcon, UserRoundPlus } from 'lucide-react';
import { toast } from 'sonner';
import z from 'zod';
import { Button } from '#/components/ui/button';
import { useAppForm } from '#/components/uix/form/useAppForm';
import { Modal } from '#/components/uix/modal/modal';
import {
	friendTagCollect,
	sendFriendRequest,
} from '#/features/friend/friend.collect.ts';
import {
	sendFriendRequestIn,
	sendFriendRequestZ,
} from '#/features/friend/friend.schema.ts';
import { authOptions } from '#/lib/auth.query.ts';
import { orpc } from '#/orpc._client';

export const AddFriendButton = ({
	id,
	children,
}: {
	id: string;
	children?: React.ReactNode;
}) => {
	const { data: session } = useQuery(authOptions.session);
	const { data: tags } = useLiveQuery((q) =>
		q.from({ friendTag: friendTagCollect }),
	);
	const tagOptions =
		tags?.map((tag) => ({ value: tag.name, label: tag.name })) || [];
	const form = useAppForm({
		validators: {
			onChange: sendFriendRequestZ,
		},
		defaultValues: {
			emitter_id: session?.user?.id,
			receiver_id: id,
			message: `我是${session?.user?.displayUsername ?? session?.user?.username}`,
		} as z.input<typeof sendFriendRequestZ>,
		onSubmit: async ({ value }) => {
			const data = sendFriendRequestZ.parse(value);
			await sendFriendRequest(data).isPersisted.promise;
			toast.success('发送成功');
		},
	});
	if (!session) {
		return null;
	}
	return (
		<form.AppForm>
			<Modal
				Trigger={
					children ?? (
						<Button>
							<UserRoundPlus />
							添加好友
						</Button>
					)
				}
				title="添加好友"
			>
				<form.Form className="space-y-3" onSubmit={form.handleSubmit}>
					<form.AppField name="message">
						{(field) => <field.FieldInput title="验证消息" />}
					</form.AppField>
					<form.AppField name="nickname">
						{(field) => <field.FieldInput title="好友昵称" />}
					</form.AppField>
					<div className="flex gap-2 ">
						<form.AppField name="tags">
							{(field) => (
								<field.FieldCheckboxGroup
									options={tagOptions}
									title="标签"
									children={<CreateTag userId={session?.user?.id} />}
								/>
							)}
						</form.AppField>
					</div>
					<div className="flex w-full  pt-4">
						<form.SubmitButton label="发送" icon={<SendIcon />} />
					</div>
				</form.Form>
			</Modal>
		</form.AppForm>
	);
};
const CreateTag = ({ userId }: { userId: string }) => {
	const form = useAppForm({
		validators: {
			onChange: z.object({
				name: z.string().min(1, '不能为空').max(20, '不能超过20个字符'),
			}),
		},
		defaultValues: {
			name: '',
		},
		onSubmit: async ({ value }) => {
			await friendTagCollect.insert({ ...value, userId });
			toast.success('创建成功');
		},
	});

	return (
		<form.AppForm>
			<Modal
				Trigger={
					<Button variant="secondary" size="xs" className="rounded-full">
						<PlusIcon />
						新建标签
					</Button>
				}
			>
				<h2 className=" text-center">新建标签</h2>
				<form.Form
					className="space-y-3"
					id="CreateTag"
					onSubmit={form.handleSubmit}
				>
					<form.AppField name="name">
						{(field) => <field.FieldInput title="标签名称" />}
					</form.AppField>
					<div className="flex w-full ">
						<form.SubmitButton
							label="创建"
							form="CreateTag"
							icon={<PlusIcon />}
						/>
					</div>
				</form.Form>
			</Modal>
		</form.AppForm>
	);
};
