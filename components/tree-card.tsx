"use client";

import { ChevronRight, MapPin } from "lucide-react";
import { cn, getTreeAge } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import type { Tree } from "@/lib/types";

export interface TreeCardProps {
  tree: Tree;
  onClick?: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * TreeCard - Clickable card displaying tree information
 *
 * @example
 * <TreeCard
 *   tree={tree}
 *   onClick={() => router.push(`/tree/${tree.id}`)}
 *   isLoading={loadingTreeId === tree.id}
 * />
 */
export function TreeCard({ tree, onClick, isLoading, className }: TreeCardProps) {
  const age = getTreeAge(tree.plantedDate);

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "w-full bg-card hover:bg-muted/50 p-4 rounded-xl shadow-sm border border-border",
        "flex items-center justify-between gap-3",
        "transition-colors cursor-pointer text-left",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:opacity-70 disabled:cursor-not-allowed",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Tree code badge */}
        <div className="bg-primary text-primary-foreground rounded-lg w-12 h-12 flex items-center justify-center font-bold text-sm shrink-0">
          {isLoading ? (
            <div className="animate-spin h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
          ) : (
            tree.code
          )}
        </div>

        {/* Tree info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-foreground truncate">
              {tree.variety}
            </span>
            <StatusBadge status={tree.status} />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <MapPin className="h-3 w-3" />
            <span>โซน {tree.zone}</span>
            <span className="mx-1">•</span>
            <span>อายุ {age}</span>
          </div>
        </div>
      </div>

      {/* Arrow indicator */}
      <ChevronRight className={cn(
        "h-5 w-5 text-muted-foreground shrink-0",
        isLoading && "opacity-50"
      )} />
    </button>
  );
}
