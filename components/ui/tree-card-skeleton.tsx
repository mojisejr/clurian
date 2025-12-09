"use client";

import { Card } from "@/components/ui/card";

export function TreeCardSkeleton() {
  return (
    <Card className="p-4 space-y-3 animate-pulse">
      {/* Header with code and status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* QR Code placeholder */}
          <div className="w-12 h-12 bg-gray-200 rounded" />
          {/* Tree code */}
          <div className="space-y-1">
            <div className="h-5 w-16 bg-gray-200 rounded" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
          </div>
        </div>
        {/* Status badge */}
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
      </div>

      {/* Tree details */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="space-y-1">
          <div className="h-3 w-12 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
        <div className="space-y-1">
          <div className="h-3 w-12 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Last log */}
      <div className="pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-1">
            <div className="h-3 w-full bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </Card>
  );
}