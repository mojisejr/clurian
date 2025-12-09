"use client";

import { useState } from "react";
import { ArrowLeft, TreePine, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { TREE_TYPES, DURIAN_VARIETIES } from "@/lib/constants";

export interface AddTreeFormProps {
  zones: string[];
  onSubmit: (data: AddTreeFormData) => Promise<void>;
  onCancel: () => void;
  className?: string;
  isLoading?: boolean;
}

export interface AddTreeFormData {
  code: string;
  zone: string;
  type: string;
  variety: string;
  plantedDate: string;
}

/**
 * AddTreeForm - Form for adding a new tree to the orchard
 */
export function AddTreeForm({
  zones,
  onSubmit,
  onCancel,
  className,
  isLoading = false,
}: AddTreeFormProps) {
  const [isNewZone, setIsNewZone] = useState(false);
  const [isCustomType, setIsCustomType] = useState(false);
  const [isCustomVariety, setIsCustomVariety] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("ทุเรียน");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return; // Prevent multiple submissions

    const formData = new FormData(e.currentTarget);

    const zone = isNewZone
      ? (formData.get("newZone") as string)
      : (formData.get("zone") as string);

    const type = isCustomType
      ? (formData.get("customType") as string)
      : (formData.get("type") as string);

    const variety = isCustomVariety
      ? (formData.get("customVariety") as string)
      : (formData.get("variety") as string);

    if (!zone) {
      alert("กรุณาระบุโซน");
      return;
    }

    await onSubmit({
      code: formData.get("code") as string,
      zone,
      type: type || "ทุเรียน",
      variety: variety || "หมอนทอง",
      plantedDate: formData.get("plantedDate") as string,
    });
  };

  // Get varieties based on selected type
  const getVarieties = () => {
    if (selectedType === "ทุเรียน") {
      return DURIAN_VARIETIES;
    }
    // For other types, return generic varieties
    return ["พื้นเมือง", "พันธุ์ดี"];
  };

  return (
    <div className={cn("max-w-lg mx-auto", className)}>
      <Button
        variant="ghost"
        onClick={onCancel}
        className="mb-4 text-muted-foreground hover:text-primary"
        disabled={isLoading}
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        ยกเลิก
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <TreePine className="h-5 w-5" />
            เพิ่มต้นไม้ใหม่
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tree Code */}
            <div className="space-y-2">
              <Label htmlFor="code">รหัสต้น *</Label>
              <Input
                id="code"
                name="code"
                placeholder="เช่น A01, B02"
                required
                disabled={isLoading}
              />
            </div>

            {/* Zone */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>โซน *</Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setIsNewZone(!isNewZone)}
                  className="text-xs h-auto p-0"
                  disabled={isLoading}
                >
                  {isNewZone ? "เลือกโซนเดิม" : "+ สร้างโซนใหม่"}
                </Button>
              </div>
              {isNewZone ? (
                <Input
                  name="newZone"
                  placeholder="ชื่อโซนใหม่"
                  required
                  disabled={isLoading}
                />
              ) : (
                <Select name="zone" required disabled={isLoading}>
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
              )}
            </div>

            {/* Tree Type */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>ประเภท</Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setIsCustomType(!isCustomType)}
                  className="text-xs h-auto p-0"
                  disabled={isLoading}
                >
                  {isCustomType ? "เลือกจากรายการ" : "+ กำหนดเอง"}
                </Button>
              </div>
              {isCustomType ? (
                <Input
                  name="customType"
                  placeholder="ระบุประเภทต้นไม้"
                  disabled={isLoading}
                />
              ) : (
                <Select
                  name="type"
                  defaultValue="ทุเรียน"
                  onValueChange={setSelectedType}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TREE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Variety */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>พันธุ์</Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setIsCustomVariety(!isCustomVariety)}
                  className="text-xs h-auto p-0"
                  disabled={isLoading}
                >
                  {isCustomVariety ? "เลือกจากรายการ" : "+ กำหนดเอง"}
                </Button>
              </div>
              {isCustomVariety ? (
                <Input
                  name="customVariety"
                  placeholder="ระบุพันธุ์"
                  disabled={isLoading}
                />
              ) : (
                <Select
                  name="variety"
                  defaultValue="หมอนทอง"
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getVarieties().map((variety) => (
                      <SelectItem key={variety} value={variety}>
                        {variety}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Planted Date */}
            <div className="space-y-2">
              <Label htmlFor="plantedDate">วันที่ปลูก</Label>
              <Input
                id="plantedDate"
                name="plantedDate"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                disabled={isLoading}
              />
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                "บันทึกต้นไม้"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
