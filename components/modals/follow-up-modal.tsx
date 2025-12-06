"use client";

import { useState } from "react";
import { Check, Calendar, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatThaiDate } from "@/lib/utils";
import type { Log } from "@/lib/types";

export interface FollowUpModalProps {
  log: Log | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (result: FollowUpResult) => void;
}

export interface FollowUpResult {
  type: "cured" | "continue";
  note: string;
  nextDate?: string;
}

/**
 * FollowUpModal - Modal for recording follow-up results
 */
export function FollowUpModal({
  log,
  open,
  onClose,
  onSubmit,
}: FollowUpModalProps) {
  const [resultType, setResultType] = useState<"cured" | "continue">("cured");
  const [note, setNote] = useState("");
  const [nextDate, setNextDate] = useState("");

  if (!log) return null;

  const handleSubmit = () => {
    onSubmit({
      type: resultType,
      note,
      nextDate: resultType === "continue" ? nextDate : undefined,
    });
    // Reset form
    setResultType("cured");
    setNote("");
    setNextDate("");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            บันทึกผลติดตาม
          </DialogTitle>
          <DialogDescription>
            กิจกรรม: {log.action}
            <br />
            นัดติดตาม: {formatThaiDate(log.followUpDate || "")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Result Type Selection */}
          <div className="space-y-2">
            <Label>ผลการติดตาม *</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setResultType("cured")}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all text-center",
                  resultType === "cured"
                    ? "border-success bg-success/10 text-success-foreground"
                    : "border-border hover:border-muted-foreground"
                )}
              >
                <Check className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">หายแล้ว</span>
              </button>
              <button
                type="button"
                onClick={() => setResultType("continue")}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all text-center",
                  resultType === "continue"
                    ? "border-warning bg-warning/10 text-warning-foreground"
                    : "border-border hover:border-muted-foreground"
                )}
              >
                <ArrowRight className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">ต้องดูแลต่อ</span>
              </button>
            </div>
          </div>

          {/* Next Follow-up Date (only for continue) */}
          {resultType === "continue" && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="nextDate">นัดติดตามครั้งถัดไป *</Label>
              <Input
                id="nextDate"
                type="date"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          )}

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="followUpNote">บันทึกเพิ่มเติม</Label>
            <Textarea
              id="followUpNote"
              placeholder="รายละเอียดผลการติดตาม..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={resultType === "continue" && !nextDate}
          >
            บันทึก
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
