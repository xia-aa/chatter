'use client';

import {
	AlertTriangle,
	CheckCircle,
	Info,
	Loader2,
	XCircle,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Button } from '#/components/uix/button/index.tsx';
import { toastError } from '../toast';
import { Modal } from './modal';
import { useModal } from './renderer';

export type ConfirmVariant = 'info' | 'destructive' | 'warning';
interface ConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: ReactNode;
	description?: ReactNode;
	onConfirm?: () => void | Promise<void>;
	confirmText?: string;
	cancelText?: string;
	variant?: ConfirmVariant;
	children?: ReactNode;
}

const getVariantStyle = (variant?: ConfirmVariant) => {
	switch (variant) {
		case 'destructive':
			return 'destructive';
		case 'warning':
			return 'default';
		default:
			return 'default';
	}
};

export function ConfirmModal({
	isOpen,
	onClose,
	title,
	description,
	onConfirm,
	confirmText = '确定',
	cancelText = '取消',
	variant,
	children,
}: ConfirmModalProps) {
	const [isLoading, setIsLoading] = useState(false);

	// const getIcon = () => {
	//   switch (variant) {
	//     case "destructive":
	//       return <XCircle className="w-5 h-5 text-destructive" />;
	//     case "warning":
	//       return <AlertTriangle className="w-5 h-5 text-orange-500" />;
	//     case "info":
	//       return <Info className="w-5 h-5 text-blue-500" />;
	//     default:
	//       return null;
	//   }
	// };

	const handleConfirm = async () => {
		if (!onConfirm) return;

		try {
			setIsLoading(true);
			await onConfirm();
			console.log('Confirm action succeeded');
			onClose();
		} catch (error) {
			console.error('Confirm action failed:', error);
			// 这里可以显示错误提示
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		if (!isLoading) {
			onClose();
		}
	};

	return (
		<Modal
			open={isOpen}
			onOpenChange={handleCancel}
			title={title}
			description={description}
		>
			{children}
			<div className="flex gap-2 mt-4">
				<Button variant="secondary" onClick={handleCancel} disabled={isLoading}>
					{cancelText}
				</Button>
				<Button
					variant={getVariantStyle(variant)}
					onClick={handleConfirm}
					pending={isLoading}
				>
					{confirmText}
				</Button>
			</div>
		</Modal>
	);
}

export function ConfirmModalContent({
	onCancel,
	onConfirm,
	cancelText,
	confirmText,
	variant,
	confirmIcon,
}: {
	onCancel?: () => void;
	onConfirm?: () => any | Promise<any>;
	cancelText?: string;
	confirmIcon?: ReactNode;
	confirmText?: string;
	variant?: ConfirmVariant;
}) {
	const { pending, setPending, closeModal } = useModal();
	const handleConfirm = async () => {
		if (!onConfirm) return;
		try {
			setPending(true);
			await onConfirm();
			console.log('Confirm action succeeded');
			closeModal();
		} catch (error) {
			toastError(error);
			console.error('Confirm action failed:', error);
			// 这里可以显示错误提示
		} finally {
			setPending(false);
		}
	};
	const handleCancel = () => {
		if (pending) return;
		if (!onCancel) {
			closeModal();
			return;
		}
		onCancel();
		closeModal();
	};
	return (
		<div className="grid grid-cols-2 gap-2 mt-4 ">
			<Button
				variant="secondary"
				size="lg"
				onClick={handleCancel}
				disabled={pending}
			>
				{cancelText ?? '取消'}
			</Button>
			<Button
				variant={getVariantStyle(variant)}
				onClick={handleConfirm}
				pending={pending}
				size="lg"
				Icon={confirmIcon}
			>
				{confirmText ?? '确定'}
			</Button>
		</div>
	);
}
