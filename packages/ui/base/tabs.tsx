import type { ValidComponent } from "solid-js"
import { splitProps } from "solid-js"
 
import type { PolymorphicProps } from "@kobalte/core/polymorphic"
import * as TabsPrimitive from "@kobalte/core/tabs"
import { cva, VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"
 
const Tabs = TabsPrimitive.Root

const tabsListVariants = cva(
	'relative flex  p-0.75 group-data-horizontal/tabs:h-8  group/tabs-list text-muted-foreground  w-fit items-center  group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col gap-1',
	{
		variants: {
			variant: {
				line: 'gap-0  p-0',
				side: 'bg-background rounded-lg group-data-[orientation=vertical]/tabs:',
			},
		},
		defaultVariants: {
			variant: 'line',
		},
	},
);
type TabsListProps<T extends ValidComponent = "div"> = TabsPrimitive.TabsListProps<T> & VariantProps<typeof tabsListVariants> & {
  class?: string | undefined
}
 
const TabsList = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, TabsListProps<T>>
) => {
  const [local, others] = splitProps(props as TabsListProps, ["class", "variant"])
  return (
    <TabsPrimitive.List
      data-variant={local.variant || 'line'}
      class={cn(
        tabsListVariants({ variant: local.variant }),
        local.class
      )}
      {...others}
    />
  )
}
 
type TabsTriggerProps<T extends ValidComponent = "button"> = TabsPrimitive.TabsTriggerProps<T> & {
  class?: string | undefined
}
 
const TabsTrigger = <T extends ValidComponent = "button">(
  props: PolymorphicProps<T, TabsTriggerProps<T>>
) => {
  const [local, others] = splitProps(props as TabsTriggerProps, ["class"])
  return (
    <TabsPrimitive.Trigger
      class={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50  data-selected:text-foreground data-selected:shadow-sm",
        'group-data-[variant=line]/tabs-list:data-selected:bg-accent/30',
        'group-data-[variant=line]/tabs-list:rounded-none',
        local.class
      )}
      {...others}
    />
  )
}
 
type TabsContentProps<T extends ValidComponent = "div"> = TabsPrimitive.TabsContentProps<T> & {
  class?: string | undefined
}
const TabsContent = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, TabsContentProps<T>>
) => {
  const [local, others] = splitProps(props as TabsContentProps, ["class"])
  return (
    <TabsPrimitive.Content
      class={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        local.class
      )}
      {...others}
    />
  )
}
 
type TabsIndicatorProps<T extends ValidComponent = "div"> = TabsPrimitive.TabsIndicatorProps<T> & {
  class?: string | undefined
}
 
const TabsIndicator = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, TabsIndicatorProps<T>>
) => {
  const [local, others] = splitProps(props as TabsIndicatorProps, ["class"])
  return (
    <TabsPrimitive.Indicator
      class={cn(
        "absolute bg-primary duration-250ms  transition-all data-[orientation=horizontal]:-bottom-px data-[orientation=vertical]:-right-px data-[orientation=horizontal]:h-0.5 data-[orientation=vertical]:w-[2px]",
        local.class
      )}
      {...others}
    />
  )
}
 
export { Tabs, TabsList, TabsTrigger, TabsContent, TabsIndicator }