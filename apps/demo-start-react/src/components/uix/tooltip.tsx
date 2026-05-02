import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '#/components/ui/tooltip';

//  ComponentProps<typeof Tooltip> &
// ComponentProps<typeof TooltipContent> &
export function UxTooltip({
	children,
	side = 'top',
	content,
}: {
	content: React.ReactNode;
	side?: 'top' | 'bottom' | 'left' | 'right';
	children: React.ReactNode;
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent side={side}>{content}</TooltipContent>
		</Tooltip>
	);
}

// export const UxTooltip = ({
//   content,
//   children,
//   delayDuration = 0,
//   align = 'center',
//   side = 'top',
//   className = '',
//   ...props
// }: React.ComponentPropsWithoutRef<typeof Tooltip> & {
//   content: JSX.Element | string | number
//   align?: 'center' | 'end' | 'start'
//   className?: string
//   side?: 'top' | 'bottom' | 'left' | 'right'
// }) => {
//   return (
//     <TooltipProvider delayDuration={delayDuration}>
//       <Tooltip {...props}>
//         {/* button */}
//         <TooltipTrigger asChild>
//           <div className={cn('flex items-center justify-center', className)}>
//             {children}
//           </div>
//         </TooltipTrigger>
//         <TooltipContent
//           className="bg-accent text-accent-foreground"
//           align={align}
//           side={side}
//         >
//           {content}
//         </TooltipContent>
//       </Tooltip>
//     </TooltipProvider>
//   )
// }
