import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const tabsVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: "text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-gray-300",
        active: "text-foreground border-b-2 border-primary",
      },
      size: {
        default: "px-4 py-2",
        sm: "px-3 py-1.5",
        lg: "px-6 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface TabsProps {
  children: React.ReactNode
  className?: string
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

interface TabsTriggerProps {
  children: React.ReactNode
  isActive: boolean
  onClick: () => void
  badge?: string | number
  className?: string
  size?: "sm" | "default" | "lg"
}

interface TabsContentProps {
  children: React.ReactNode
  className?: string
}

export function Tabs({ children, className }: TabsProps) {
  return (
    <div className={cn("w-full", className)}>
      {children}
    </div>
  )
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div className={cn(
      "inline-flex h-9 items-center justify-start rounded-none bg-transparent p-0 w-full border-b border-border",
      className
    )}>
      {children}
    </div>
  )
}

export function TabsTrigger({
  children,
  isActive,
  onClick,
  badge,
  className,
  size = "default"
}: TabsTriggerProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      className={cn(
        tabsVariants({
          variant: isActive ? "active" : "default",
          size
        }),
        "relative",
        className
      )}
      onClick={onClick}
    >
      {children}
      {badge && (
        <span className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/10 px-1 text-xs font-medium text-primary">
          {badge}
        </span>
      )}
    </button>
  )
}

export function TabsContent({ children, className }: TabsContentProps) {
  return (
    <div className={cn("mt-4", className)}>
      {children}
    </div>
  )
}