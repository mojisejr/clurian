"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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

export interface MixingFormula {
  id: string;
  name: string;
  description?: string;
}

export interface AddLogFormProps {
  isBatch: boolean;
  treeCode?: string;
  zones?: string[];
  onSubmit: (data: AddLogFormData) => Promise<void>;
  onCancel: () => void;
  className?: string;
  isLoading?: boolean;
  mixingFormulas?: MixingFormula[];
  isLoadingFormulas?: boolean;
  dataTestId?: string;
}

export interface AddLogFormData {
  targetZone?: string; // for batch logs
  action: string;
  date: string;
  note: string;
  followUpDate?: string;
  mixingFormulaId?: string;
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
  mixingFormulas = [],
  isLoadingFormulas = false,
  dataTestId,
}: AddLogFormProps) {
  const [isCustomAction, setIsCustomAction] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedFormula, setSelectedFormula] = useState("none");

  const title = useMemo(() =>
    isBatch
      ? "บันทึกงานเหมาแปลง (Batch)"
      : `บันทึกงานต้น ${treeCode}`,
    [isBatch, treeCode]
  );

  const Icon = useMemo(() =>
    isBatch ? Sprout : Leaf,
    [isBatch]
  );

  // Use Set for O(1) lookup instead of O(n) array.some
  const chemicalActionsSet = useMemo(() =>
    new Set(['พ่นยา/ฮอร์โมน', 'ใส่ปุ๋ย']),
    []
  );

  const requiresFormula = useMemo(() =>
    chemicalActionsSet.has(selectedAction),
    [chemicalActionsSet, selectedAction]
  );

  const selectedFormulaDetails = useMemo(() =>
    selectedFormula && selectedFormula !== "none" ? mixingFormulas.find(f => f.id === selectedFormula) : null,
    [mixingFormulas, selectedFormula]
  );

  // Reset formula when action changes, but don't auto-select
  useEffect(() => {
    if (!requiresFormula) {
      setSelectedFormula("none");
    }
  }, [requiresFormula]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
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
      mixingFormulaId: requiresFormula && selectedFormula !== "none" ? selectedFormula : undefined,
    });
  }, [isCustomAction, isBatch, isLoading, onSubmit, requiresFormula, selectedFormula]);

  return (
    <Card className={cn("max-w-lg mx-auto mt-4", className)} data-testid={dataTestId || "add-log-form"}>
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
                <SelectTrigger data-testid="target-zone-select">
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
                onChange={(e) => setSelectedAction(e.target.value)}
              />
            ) : (
              <Select
                name="action"
                required
                disabled={isLoading}
                onValueChange={(value) => setSelectedAction(value)}
                value={selectedAction}
              >
                <SelectTrigger data-testid="action-select">
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

          {/* Mixing Formula Selection */}
          {requiresFormula && (
            <div className="space-y-2">
              <Label htmlFor="mixingFormula">
                เลือกสูตรผสม (ถ้ามี){" "}
                <span className="text-muted-foreground text-xs">(ไม่บังคับ)</span>
              </Label>
              {isLoadingFormulas ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังโหลดสูตรผสม...
                </div>
              ) : mixingFormulas.length === 0 ? (
                <div className="text-sm text-muted-foreground p-3 border rounded-md">
                  ไม่มีสูตรผสมที่บันทึกไว้
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="p-0 h-auto ml-2"
                    onClick={() => window.location.href = '/dashboard/mixing'}
                  >
                    สร้างสูตรใหม่
                  </Button>
                </div>
              ) : (
                <Select
                  name="mixingFormula"
                  disabled={isLoading}
                  onValueChange={(value) => setSelectedFormula(value)}
                  value={selectedFormula}
                >
                  <SelectTrigger data-testid="formula-select">
                    <SelectValue placeholder="เลือกสูตรผสม" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ไม่เลือกสูตร</SelectItem>
                    {mixingFormulas.map((formula) => (
                      <SelectItem key={formula.id} value={formula.id}>
                        {formula.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Show selected formula details */}
              {selectedFormulaDetails && (
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <div className="font-medium text-sm">{selectedFormulaDetails.name}</div>
                  {selectedFormulaDetails.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {selectedFormulaDetails.description}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
            <Button type="submit" className="flex-1" disabled={isLoading} data-testid="submit-btn">
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
