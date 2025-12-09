"use client";

import React from 'react';
import { ClipboardList, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BatchActivitiesViewProps {
  onAddBatchLog: () => void;
}

export function BatchActivitiesView({ onAddBatchLog }: BatchActivitiesViewProps) {
  return (
    <div className="space-y-4">
      <Button
        className="w-full gap-2"
        onClick={onAddBatchLog}
      >
        <PlusCircle size={18} /> บันทึกงานทั้งแปลง
      </Button>

      <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
        <ClipboardList className="mx-auto mb-2 opacity-50" size={48} />
        <p className="text-lg font-medium">งานทั้งแปลง</p>
        <p className="text-sm mt-1">ยังไม่มีบันทึกงานทั้งแปลง</p>
        <p className="text-xs mt-1">กดปุ่ม &quot;บันทึกงานทั้งแปลง&quot; เพื่อเพิ่มบันทึกใหม่</p>
      </div>

      <div className="pt-4 border-t text-center text-xs text-muted-foreground">
          CLURIAN: Orchard Manager v1.1
      </div>
    </div>
  );
}