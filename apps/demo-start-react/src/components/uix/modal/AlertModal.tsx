'use client';

import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '#/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '#/components/ui/dialog';

interface AlertModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: ReactNode;
	description?: ReactNode;
	confirmText?: string;
	variant?: 'info' | 'success' | 'warning';
}

export function AlertModal({
	isOpen,
	onClose,
	title,
	description,
	confirmText = '确定',
	variant = 'info',
}: AlertModalProps) {
	const getIcon = () => {
		switch (variant) {
			case 'success':
				return <CheckCircle className="w-5 h-5 text-green-500" />;
			case 'warning':
				return <AlertTriangle className="w-5 h-5 text-orange-500" />;
			default:
				return <Info className="w-5 h-5 text-blue-500" />;
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{getIcon()}
						{title}
					</DialogTitle>
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>

				<DialogFooter>
					<Button onClick={onClose} className="min-w-[80px]">
						{confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
