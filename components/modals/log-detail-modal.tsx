"use client";

import { Calendar, ClipboardList } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { formatThaiDate, getDaysRemaining } from "@/lib/utils";
import type { Log } from "@/lib/types";

export interface LogDetailModalProps {
  log: Log | null;
  open: boolean;
  onClose: () => void;
  onFollowUp?: () => void;
}

/**
 * LogDetailModal - Modal displaying log details with follow-up option
 */
export function LogDetailModal({
  log,
  open,
  onClose,
  onFollowUp,
}: LogDetailModalProps) {
  if (!log) return null;

  const isFollowUp = log.status === "IN_PROGRESS";
  const daysRemaining = log.followUpDate ? getDaysRemaining(log.followUpDate) : null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-primary p-6 text-primary-foreground pt-10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary-foreground">
              <ClipboardList className="h-5 w-5" />
              รายละเอียดกิจกรรม
            </DialogTitle>
          </DialogHeader>
          <p className="text-lg font-bold mt-3">{log.action}</p>
          <p className="text-sm opacity-80">{formatThaiDate(log.performDate)}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">สถานะ</span>
            <StatusBadge
              variant={isFollowUp ? "warning" : "success"}
              size="lg"
            >
              {isFollowUp ? "รอติดตาม" : "เสร็จสิ้น"}
            </StatusBadge>
          </div>

          {/* Type */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">ประเภท</span>
            <span className="text-sm font-medium">
              {log.logType === "BATCH" ? `งานเหมา (โซน ${log.targetZone})` : "งานรายต้น"}
            </span>
          </div>

          {/* Note */}
          {log.note && (
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">บันทึก</span>
              <p className="text-sm bg-muted p-3 rounded-lg">{log.note}</p>
            </div>
          )}

          {/* Follow-up Date */}
          {log.followUpDate && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                นัดติดตาม
              </span>
              <div className="text-right">
                <span className="text-sm font-medium">
                  {formatThaiDate(log.followUpDate)}
                </span>
                {daysRemaining && (
                  <StatusBadge
                    variant={daysRemaining.variant}
                    size="sm"
                    className="ml-2"
                  >
                    {daysRemaining.text}
                  </StatusBadge>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              ปิด
            </Button>
            {isFollowUp && onFollowUp && (
              <Button onClick={onFollowUp} className="flex-1">
                บันทึกผลติดตาม
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
