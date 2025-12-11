import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { TreeStatus, UITreeStatus } from "@/lib/types";
import { STATUS_CONFIG } from "@/lib/constants";
import { treeStatusFromUI } from "@/lib/domain/mappers";

const statusBadgeVariants = cva(
  "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border whitespace-nowrap",
  {
    variants: {
      variant: {
        secondary:
          "bg-secondary text-secondary-foreground border-secondary",
        accent:
          "bg-accent text-accent-foreground border-accent",
        destructive:
          "bg-destructive text-destructive-foreground border-destructive",
        muted:
          "bg-muted text-muted-foreground border-border",
        warning:
          "bg-warning text-warning-foreground border-warning",
        success:
          "bg-success text-success-foreground border-success",
      },
      size: {
        default: "px-2 py-0.5 text-[10px]",
        sm: "px-1.5 py-0.5 text-[9px]",
        lg: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "default",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  status?: TreeStatus | UITreeStatus; // Accept both formats
}

/**
 * StatusBadge - Displays tree health status with appropriate styling
 *
 * @example
 * // Using status prop (auto-maps to variant and label)
 * <StatusBadge status="healthy" />
 * <StatusBadge status="sick" />
 *
 * @example
 * // Using variant directly with custom label
 * <StatusBadge variant="warning">รอติดตาม</StatusBadge>
 */
export function StatusBadge({
  className,
  variant,
  size,
  status,
  children,
  ...props
}: StatusBadgeProps) {
  // If status is provided, convert to TreeStatus and use STATUS_CONFIG for variant and label
  const normalizedStatus = status ? treeStatusFromUI(status as UITreeStatus) : undefined;
  const config = normalizedStatus ? STATUS_CONFIG[normalizedStatus] : null;
  const resolvedVariant = variant ?? config?.variant ?? "secondary";
  const label = children ?? config?.label ?? "";

  return (
    <span
      className={cn(statusBadgeVariants({ variant: resolvedVariant, size }), className)}
      {...props}
    >
      {label}
    </span>
  );
}
