import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { type ToggleVariantProps, toggleVariants } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  ToggleVariantProps) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(
        "flex items-center rounded-md border border-input",
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  ToggleVariantProps) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        toggleVariants({ variant: variant ?? "default", size: size ?? "sm" }),
        "flex-1 rounded-none border-0 first:rounded-l-md last:rounded-r-md",
        className,
      )}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
