'use client';
import { createStore, useStore } from '@tanstack/react-store';
import { Modal, type ModalProps } from './modal';

export type ModalState = Omit<
	ModalProps,
	'children' | 'Trigger' | 'onOpenChange' | 'defaultOpen'
> & {
	content?: ModalProps['children'];
	pending?: boolean;
};

export const modalRendererStore = createStore<ModalState>({
	open: false,
	pending: false,
});

const setOpen = (open: boolean) => {
	modalRendererStore.setState((prev) => ({ ...prev, open }));
};
const setPending = (pending: boolean) => {
	modalRendererStore.setState((prev) => ({ ...prev, pending }));
};

type OpenModalOptions = Omit<ModalState, 'open' | 'content'>;
export const openModal = (
	content: ModalProps['children'] | ((close: () => void) => React.ReactNode),
	options?: OpenModalOptions,
) => {
	console.log('openModal');
	modalRendererStore.setState((prev) => ({
		...options,
		open: true,
		content: typeof content === 'function' ? content(closeModal) : content,
	}));
};
export const closeModal = () => {
	console.log('closeModal');
	modalRendererStore.setState((prev) => ({ ...prev, open: false }));
};

export const useModal = () => {
	const state = useStore(modalRendererStore, (state) => state);
	return { ...state, setOpen, setPending, openModal, closeModal };
};

export const ModalRenderer = () => {
	const {
		open,
		pending,
		setOpen,
		content,
		title,
		description,
		closeOnOverlayClick,
		size,
		showCloseButton,
		...props
	} = useModal();
	return (
		<Modal
			{...props}
			open={open}
			onOpenChange={setOpen}
			title={title}
			description={description}
			closeOnOverlayClick={closeOnOverlayClick}
			size={size}
			children={content}
			showCloseButton={showCloseButton}
			pending={pending}
		/>
	);
};
