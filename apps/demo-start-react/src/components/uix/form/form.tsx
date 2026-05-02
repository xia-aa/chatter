import {
	type AnyFieldMeta,
	createFormHookContexts,
	FieldApi,
	useStore,
} from '@tanstack/react-form';
import { ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { useLocalStorage } from 'usehooks-ts';
import { useTheme } from '#/components/app/theme-provider';
import { Button } from '#/components/ui/button';
import { Spinner } from '#/components/ui/spinner';
import { cn } from '#/lib/utils';
import { toastError } from '../toast';
export const { fieldContext, formContext, useFieldContext, useFormContext } =
	createFormHookContexts();

export const Form = ({
	className,
	children,
	onSubmit,
	id,
}: {
	className?: string;
	children: React.ReactNode;
	onSubmit?: () => void | Promise<void>;
	id?: string;
}) => {
	return (
		<form
			className={className}
			onSubmit={async (e) => {
				e.preventDefault();
				try {
					await onSubmit?.();
				} catch (error) {
					toastError(error);
				}
			}}
			id={id}
		>
			{children}
		</form>
	);
};
export const SubmitButton = ({
	label = '提交',
	icon,
	className,
	form: formId,
	canSubmitDefault = false,
	...props
}: React.ComponentProps<typeof Button> & {
	label?: string;
	className?: string;
	icon?: React.ReactNode;
	form?: string;
	canSubmitDefault?: boolean;
}) => {
	const form = useFormContext();
	return (
		<form.Subscribe
			selector={(state) => {
				return {
					canNext: state.errors.length === 0,
					isSubmitting: state.isSubmitting,
					isDefaultValue: state.isDefaultValue,
				};
			}}
		>
			{({ canNext, isSubmitting, isDefaultValue }) => (
				<Button
					{...props}
					type="submit"
					disabled={
						isSubmitting || !canNext || (isDefaultValue && !canSubmitDefault)
					}
					className={className}
					form={formId}
				>
					{icon ? (
						<span className={`shrink-0  ${isSubmitting ? 'animate-spin' : ''}`}>
							{icon}
						</span>
					) : (
						isSubmitting && <Spinner />
					)}
					{label}
				</Button>
			)}
		</form.Subscribe>
	);
};

// return a form.Subscribe.selector
const selector =
	({
		isFirstStep = true,
		currentFields,
	}: {
		isFirstStep: boolean;
		currentFields: 'all' | readonly string[];
	}) =>
	(state: ReturnType<typeof useFormContext>['state']) => {
		let hasErrors = false;
		let isTouched = false;
		for (const field of currentFields) {
			const meta = (state.fieldMeta as Record<string, AnyFieldMeta>)[field];
			if (meta) {
				if (meta.errors.length > 0) hasErrors = true;
				if (meta.isTouched) isTouched = true;
			}
			// 早停：如果已确定 hasErrors 和 hasTouched，都 true 时停止
			if (hasErrors && isTouched) break;
		}
		return {
			canNext: !(hasErrors || (isFirstStep && !isTouched)),
			isTouched,
			isSubmitting: state.isSubmitting,
		};
	};

export const NextButton = ({
	label = '下一步',
	isFirstStep = true,
	currentFields,
	handleNext,
}: {
	label?: string;
	isFirstStep: boolean;
	currentFields: readonly string[];
	handleNext: () => void | Promise<void>;
}) => {
	const form = useFormContext();
	return (
		<form.Subscribe selector={selector({ isFirstStep, currentFields })}>
			{({ canNext, isTouched }) =>
				(!isFirstStep || isTouched) && (
					<Button
						type="button"
						variant="secondary"
						onClick={handleNext}
						disabled={!canNext}
					>
						{label}
						<ChevronRight />
					</Button>
				)
			}
		</form.Subscribe>
	);
};
export const FloatingSaveBar = ({
	view,
	isSubmitting,
	reset,
	isSubmitSuccessful,
}: {
	view: boolean;
	isSubmitting: boolean;
	reset: () => void;
	isSubmitSuccessful: boolean;
}) => {
	const { theme, systemTheme } = useTheme();
	const TOAST_ID = 'floating_save_bar';
	useEffect(() => {
		console.log('FloatingSaveBar.useEffect:', view);
		if (view) {
			toast(
				<div className="flex justify-between items-center w-full py-2.5 px-3 bg-popover rounded-md">
					<span className="text-foreground">注意！您尚未保存更改！</span>
					<div className="flex items-center gap-2">
						<Button
							variant="link"
							onClick={() => {
								reset();
								// toast.dismiss(TOAST_ID)
							}}
						>
							重置
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting && <Spinner />}
							保存更改
						</Button>
					</div>
				</div>,
				{
					id: TOAST_ID,
					toasterId: 'form',
					position: 'bottom-center',
					classNames: {
						toast: 'p-0! border-0!',
						content: cn('w-full'),
					},
					duration: Infinity,
					richColors: true,
				},
			);
		} else {
			toast.dismiss(TOAST_ID);
		}
	}, [view, isSubmitting, reset]);
	useEffect(() => {
		if (isSubmitSuccessful) {
			console.log('FloatingSaveBar.useEffect: isSubmitSuccessful');
			reset();
			toast.dismiss(TOAST_ID);
		}
	}, [isSubmitSuccessful, reset]);

	return <Toaster id="form" theme={theme === 'system' ? systemTheme : theme} />;
};
export const FormFloatingSaveBar = ({
	watchedFields,
}: {
	watchedFields?: readonly string[];
}) => {
	const form = useFormContext();
	return (
		<form.Subscribe
			selector={(state) => {
				if (!watchedFields) {
					return {
						view:
							state.isDirty &&
							state.errors.length === 0 &&
							!state.isDefaultValue,
						isSubmitSuccessful: state.isSubmitSuccessful,
						isSubmitting: state.isSubmitting,
					};
				}
				let hasErrors = false;
				let isDirty = false;
				let isDefaultValue = true;
				// TODO: 注意检查是否存在逻辑错误
				for (const field of watchedFields) {
					const meta = (state.fieldMeta as Record<string, AnyFieldMeta>)[field];
					if (meta) {
						if (meta.errors.length > 0) hasErrors = true;
						if (meta.isDirty) isDirty = true;
						if (!meta.isDefaultValue) isDefaultValue = false;
					}

					if (!hasErrors && isDirty && !isDefaultValue) break;
				}
				return {
					view: isDirty && !hasErrors && !isDefaultValue,
					isSubmitSuccessful: state.isSubmitSuccessful,
					isSubmitting: state.isSubmitting,
				};
			}}
		>
			{({ view, isSubmitting, isSubmitSuccessful }) => (
				<FloatingSaveBar
					view={view}
					isSubmitting={isSubmitting}
					reset={form.reset}
					isSubmitSuccessful={isSubmitSuccessful}
				/>
			)}
		</form.Subscribe>
	);
};

// 同步到 localStorage
export const SyncToLocalStorage = () => {
	const form = useFormContext();
	const values = useStore(form.store, (state) => state.values);
	useEffect(() => {
		// 如果是 空对象 或 { k: undefined } 这种形式，说明没有实际的值，避免误覆盖 localStorage 中的有效数据
		if (
			Object.keys(values).length === 0 ||
			Object.values(values).every((v) => v === undefined)
		)
			return;
		console.log('SyncToLocalStorage.useEffect:', values);
		localStorage.setItem(form.formId, JSON.stringify(values));
	}, [values, form.formId]);
	return null;
};
