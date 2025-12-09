"use client";

import { useState } from "react";
import { Leaf, Sprout, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LOG_ACTIONS } from "@/lib/constants";

export interface AddLogFormProps {
  isBatch: boolean;
  treeCode?: string;
  zones?: string[];
  onSubmit: (data: AddLogFormData) => Promise<void>;
  onCancel: () => void;
  className?: string;
  isLoading?: boolean;
}

export interface AddLogFormData {
  targetZone?: string; // for batch logs
  action: string;
  date: string;
  note: string;
  followUpDate?: string;
}

/**
 * AddLogForm - Form for adding activity logs (individual or batch)
 */
export function AddLogForm({
  isBatch,
  treeCode,
  zones = [],
  onSubmit,
  onCancel,
  className,
  isLoading = false,
}: AddLogFormProps) {
  const [isCustomAction, setIsCustomAction] = useState(false);

  const title = isBatch
    ? "บันทึกงานเหมาแปลง (Batch)"
    : `บันทึกงานต้น ${treeCode}`;
  const Icon = isBatch ? Sprout : Leaf;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return; // Prevent multiple submissions

    const formData = new FormData(e.currentTarget);

    const action = isCustomAction
      ? (formData.get("customAction") as string)
      : (formData.get("action") as string);

    await onSubmit({
      targetZone: isBatch ? (formData.get("targetZone") as string) : undefined,
      action,
      date: formData.get("date") as string,
      note: formData.get("note") as string,
      followUpDate: formData.get("followUpDate") as string || undefined,
    });
  };

  return (
    <Card className={cn("max-w-lg mx-auto mt-4", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Zone (for batch logs only) */}
          {isBatch && (
            <div className="space-y-2">
              <Label htmlFor="targetZone">โซนเป้าหมาย *</Label>
              <Select name="targetZone" required disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกโซน" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      โซน {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Action */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>กิจกรรม *</Label>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => setIsCustomAction(!isCustomAction)}
                className="text-xs h-auto p-0"
                disabled={isLoading}
              >
                {isCustomAction ? "เลือกจากรายการ" : "+ กำหนดเอง"}
              </Button>
            </div>
            {isCustomAction ? (
              <Input
                name="customAction"
                placeholder="ระบุกิจกรรม"
                required
                disabled={isLoading}
              />
            ) : (
              <Select name="action" required disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกกิจกรรม" />
                </SelectTrigger>
                <SelectContent>
                  {LOG_ACTIONS.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">วันที่ดำเนินการ *</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
              disabled={isLoading}
            />
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">บันทึกเพิ่มเติม</Label>
            <Textarea
              id="note"
              name="note"
              placeholder="รายละเอียดเพิ่มเติม..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Follow-up Date */}
          <div className="space-y-2">
            <Label htmlFor="followUpDate">
              วันนัดติดตามผล{" "}
              <span className="text-muted-foreground text-xs">(ถ้ามี)</span>
            </Label>
            <Input
              id="followUpDate"
              name="followUpDate"
              type="date"
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isLoading}
            >
              ยกเลิก
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                "บันทึก"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
