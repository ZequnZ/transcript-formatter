import { Group, Panel, Separator } from "react-resizable-panels"
import { cn } from "@/lib/utils"
import { GripVertical } from "lucide-react"

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof Group>) {
  return (
    <Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  )
}

function ResizablePanel({ ...props }: React.ComponentProps<typeof Panel>) {
  return <Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & { withHandle?: boolean }) {
  return (
    <Separator
      data-slot="resizable-handle"
      className={cn(
        "bg-border focus-visible:ring-ring relative flex w-1 items-center justify-center after:absolute after:inset-y-0 after:-left-3 after:-right-3 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden hover:bg-primary/20 active:bg-primary/30 transition-colors data-[panel-group-direction=vertical]:h-1 data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:inset-x-0 data-[panel-group-direction=vertical]:after:-top-3 data-[panel-group-direction=vertical]:after:-bottom-3 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-8 w-4 items-center justify-center rounded-sm border shadow-sm hover:bg-accent">
          <GripVertical className="size-3 text-muted-foreground" />
        </div>
      )}
    </Separator>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
