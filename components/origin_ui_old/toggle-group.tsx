"use client"

import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils";;
import { toggleVariants } from "@/components/origin_ui_old/toggle";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
})

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(
        "group/toggle-group flex items-center",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "min-w-0 shrink-0 rounded-none shadow-none",
        // Horizontal layout (sm and up) - remove left border except for first element
        "sm:data-[variant=outline]:border-l-0 sm:data-[variant=outline]:first:border-l",
        // Small screen - simpler approach with separate classes
        "max-sm:[&[data-variant=outline]:not(:first-child)]:border-l",
        "max-sm:[&[data-variant=outline]:not(:first-child)]:[border-top-width:0!important]",
        // Small screen - rounded corners for first and last elements
        "max-sm:first:rounded-t-lg max-sm:last:rounded-b-lg",

        // Rounded corners for first and last elements on sm and up (horizontal mode)
        "sm:first:rounded-l-md sm:last:rounded-r-md",
        "sm:not(:first-child):not(:last-child):rounded-none",
        "focus:z-10 focus-visible:z-10",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }