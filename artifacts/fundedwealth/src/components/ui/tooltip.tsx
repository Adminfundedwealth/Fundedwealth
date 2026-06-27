import * as React from "react"

// Simplified tooltip that doesn't use @radix-ui/react-tooltip
// to avoid duplicate React instance issues

const TooltipProvider = ({ children, ...props }: { children: React.ReactNode; delayDuration?: number }) => {
  return <>{children}</>
}

const Tooltip = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const TooltipTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(
  ({ children, asChild, ...props }, ref) => {
    if (asChild) return <>{children}</>
    return <button ref={ref} {...props}>{children}</button>
  }
)
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { sideOffset?: number; side?: string }>(
  ({ children, className, sideOffset, side, ...props }, ref) => {
    return null // tooltips disabled temporarily
  }
)
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
