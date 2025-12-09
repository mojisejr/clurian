"use client";

import React from 'react';
import { ClipboardList } from "lucide-react";

export function BatchActivitiesView() {
  return (
    <div className="space-y-4">
      <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
        <ClipboardList className="mx-auto mb-2 opacity-50" size={48} />
        <p className="text-lg font-medium">งานทั้งแปลง</p>
        <p className="text-sm mt-1">Batch Activities - Coming Soon</p>
      </div>

      <div className="pt-4 border-t text-center text-xs text-muted-foreground">
          CLURIAN: Orchard Manager v1.1
      </div>
    </div>
  );
}