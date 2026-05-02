'use client';
import { Autocomplete } from '@base-ui/react/autocomplete';
import { ChevronDownIcon, XIcon } from 'lucide-react';
import { cn } from '#/lib/utils';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from './input-group';

// https://base-ui.com/react/components/autocomplete#root
export const AutocompleteRoot = Autocomplete.Root;

export function AutocompleteTrigger({
	className,
	children,
	...props
}: Autocomplete.Trigger.Props) {
	return (
		<Autocomplete.Trigger
			data-slot="autocomplete-trigger"
			className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
			{...props}
		>
			{children}
			<ChevronDownIcon
				data-slot="autocomplete-trigger-icon"
				className="pointer-events-none size-4 text-muted-foreground"
			/>
		</Autocomplete.Trigger>
	);
}
export function AutocompleteClear({
	className,
	...props
}: Autocomplete.Clear.Props) {
	return (
		<Autocomplete.Clear
			data-slot="autocomplete-clear"
			render={<InputGroupButton variant="ghost" size="icon-xs" />}
			className={cn(className)}
			{...props}
		>
			<XIcon className="pointer-events-none" />
		</Autocomplete.Clear>
	);
}
export function AutocompleteInput({
	className,
	children,
	disabled = false,
	showTrigger = true,
	showClear = false,
	...props
}: Autocomplete.Input.Props & {
	showTrigger?: boolean;
	showClear?: boolean;
}) {
	return (
		<InputGroup className={cn('w-auto', className)}>
			<Autocomplete.Input
				render={<InputGroupInput disabled={disabled} />}
				{...props}
			/>
			<InputGroupAddon align="inline-end">
				{showTrigger && (
					<InputGroupButton
						size="icon-xs"
						variant="ghost"
						asChild
						data-slot="input-group-button"
						className="group-has-data-[slot=autocomplete-clear]/input-group:hidden data-pressed:bg-transparent"
						disabled={disabled}
					>
						<AutocompleteTrigger />
					</InputGroupButton>
				)}
				{showClear && <AutocompleteClear disabled={disabled} />}
			</InputGroupAddon>
			{children}
		</InputGroup>
	);
}

export function AutocompletePopup({
	className,
	side = 'bottom',
	sideOffset = 6,
	align = 'start',
	alignOffset = 0,
	anchor,
	...props
}: Autocomplete.Popup.Props &
	Pick<
		Autocomplete.Positioner.Props,
		'side' | 'align' | 'sideOffset' | 'alignOffset' | 'anchor'
	>) {
	return (
		<Autocomplete.Portal>
			<Autocomplete.Positioner
				side={side}
				sideOffset={sideOffset}
				align={align}
				alignOffset={alignOffset}
				anchor={anchor}
				className="isolate z-50 pointer-events-auto!"
			>
				<Autocomplete.Popup
					data-slot="autocomplete-popup"
					data-chips={!!anchor}
					className={cn(
						'group/autocomplete-popup relative max-h-96 w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] origin-(--transform-origin) overflow-hidden rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[chips=true]:min-w-(--anchor-width) data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:border-input/30 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:shadow-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
						className,
					)}
					{...props}
				/>
			</Autocomplete.Positioner>
		</Autocomplete.Portal>
	);
}
export function AutocompleteList({
	className,
	...props
}: Autocomplete.List.Props) {
	return (
		<Autocomplete.List
			data-slot="autocomplete-list"
			className={cn(
				'max-h-[min(calc(--spacing(96)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto p-1 data-empty:p-0',
				className,
			)}
			{...props}
		/>
	);
}
export function AutocompleteItem({
	className,
	children,
	...props
}: Autocomplete.Item.Props) {
	return (
		<Autocomplete.Item
			data-slot="autocomplete-item"
			className={cn(
				"relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		>
			{children}
		</Autocomplete.Item>
	);
}
export function AutocompleteGroup({
	className,
	...props
}: Autocomplete.Group.Props) {
	return (
		<Autocomplete.Group
			data-slot="autocomplete-group"
			className={cn(className)}
			{...props}
		/>
	);
}

export function AutocompleteLabel({
	className,
	...props
}: Autocomplete.GroupLabel.Props) {
	return (
		<Autocomplete.GroupLabel
			data-slot="autocomplete-label"
			className={cn(
				'px-2 py-1.5 text-xs text-muted-foreground pointer-coarse:px-3 pointer-coarse:py-2 pointer-coarse:text-sm',
				className,
			)}
			{...props}
		/>
	);
}

export function AutocompleteCollection({
	...props
}: Autocomplete.Collection.Props) {
	return (
		<Autocomplete.Collection data-slot="autocomplete-collection" {...props} />
	);
}

export function AutocompleteEmpty({
	className,
	...props
}: Autocomplete.Empty.Props) {
	return (
		<Autocomplete.Empty
			data-slot="autocomplete-empty"
			className={cn(
				'empty:m-0 empty:p-0 w-full justify-center p-2  text-sm text-muted-foreground group-data-empty/autocomplete-content:flex',
				className,
			)}
			{...props}
		/>
	);
}

export function AutocompleteSeparator({
	className,
	...props
}: Autocomplete.Separator.Props) {
	return (
		<Autocomplete.Separator
			data-slot="autocomplete-separator"
			className={cn('-mx-1 my-1 h-px bg-border', className)}
			{...props}
		/>
	);
}
