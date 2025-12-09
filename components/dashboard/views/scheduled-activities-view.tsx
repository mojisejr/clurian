"use client";

import React from 'react';
import { Calendar } from "lucide-react";

export function ScheduledActivitiesView() {
  return (
    <div className="space-y-4">
      <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
        <Calendar className="mx-auto mb-2 opacity-50" size={48} />
        <p className="text-lg font-medium">งานที่ต้องทำ</p>
        <p className="text-sm mt-1">Scheduled Activities - Coming Soon</p>
      </div>

      <div className="pt-4 border-t text-center text-xs text-muted-foreground">
          CLURIAN: Orchard Manager v1.1
      </div>
    </div>
  );
}