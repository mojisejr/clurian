"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, FileText, Clock, Plus } from "lucide-react";

export interface BatchLogFormData {
  date: string;
  action: string;
  targetZone: string;
  note: string;
  materials: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>;
  labor: {
    workers: number;
    hours: number;
  };
  followUpDate: string;
  followUpRequired: boolean;
}

interface BatchLogFormProps {
  zones: string[];
  onCancel: () => void;
  onSubmit: (data: BatchLogFormData) => Promise<void>;
  isLoading?: boolean;
}

export function BatchLogForm({ zones, onCancel, onSubmit, isLoading = false }: BatchLogFormProps) {
  const [formData, setFormData] = useState<BatchLogFormData>({
    date: new Date().toISOString().split('T')[0],
    action: '',
    targetZone: zones[0] || '',
    note: '',
    materials: [{ name: '', quantity: '', unit: '' }],
    labor: { workers: 0, hours: 0 },
    followUpDate: '',
    followUpRequired: false,
  });

  const handleInputChange = (field: keyof BatchLogFormData, value: string | number | boolean | Array<{ name: string; quantity: string; unit: string }> | { workers: number; hours: number }) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMaterialChange = (index: number, field: string, value: string) => {
    const newMaterials = [...formData.materials];
    newMaterials[index] = { ...newMaterials[index], [field]: value };
    setFormData(prev => ({ ...prev, materials: newMaterials }));
  };

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, { name: '', quantity: '', unit: '' }]
    }));
  };

  const removeMaterial = (index: number) => {
    const newMaterials = formData.materials.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, materials: newMaterials }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const batchActions = [
    'ให้น้ำ',
    'ใส่ปุ๋ย',
    'ตัดแต่งกิ่ง',
    'กำจัดวัชพืช',
    'พ่นยาฆ่าแมลง',
    'พ่นยาป้องกันโรค',
    'ปรับสภาพดิน',
    'เก็บเกี่ยว'
  ];

  const materialUnits = ['กิโลกรัม', 'กรัม', 'ลิตร', 'มิลลิลิตร', 'ถุง', 'ขวด', 'โหล'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">บันทึกงานทั้งแปลง</h1>
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          ยกเลิก
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText size={18} />
              ข้อมูลพื้นฐาน
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">วันที่ดำเนินการ</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="action">ชนิดของงาน</Label>
                <Select value={formData.action} onValueChange={(value) => handleInputChange('action', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกชนิดของงาน" />
                  </SelectTrigger>
                  <SelectContent>
                    {batchActions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="targetZone">โซนที่ดำเนินการ</Label>
              <Select value={formData.targetZone} onValueChange={(value) => handleInputChange('targetZone', value)}>
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

            <div>
              <Label htmlFor="note">บันทึกเพิ่มเติม</Label>
              <Textarea
                id="note"
                placeholder="รายละเอียดการดำเนินงาน..."
                value={formData.note}
                onChange={(e) => handleInputChange('note', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Materials Used */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">วัสดุที่ใช้</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.materials.map((material, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 items-start">
                <Input
                  placeholder="ชื่อวัสดุ"
                  value={material.name}
                  onChange={(e) => handleMaterialChange(index, 'name', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="จำนวน"
                  value={material.quantity}
                  onChange={(e) => handleMaterialChange(index, 'quantity', e.target.value)}
                />
                <Select value={material.unit} onValueChange={(value) => handleMaterialChange(index, 'unit', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="หน่วย" />
                  </SelectTrigger>
                  <SelectContent>
                    {materialUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeMaterial(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  ลบ
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addMaterial}
              className="w-full border-dashed"
            >
              <Plus size={16} className="mr-2" />
              เพิ่มวัสดุ
            </Button>
          </CardContent>
        </Card>

        {/* Labor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock size={18} />
              ข้อมูลแรงงาน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workers">จำนวนคน (คน)</Label>
                <Input
                  id="workers"
                  type="number"
                  min="0"
                  value={formData.labor.workers}
                  onChange={(e) => handleInputChange('labor', { ...formData.labor, workers: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="hours">ระยะเวลา (ชั่วโมง)</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.labor.hours}
                  onChange={(e) => handleInputChange('labor', { ...formData.labor, hours: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Follow-up */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar size={18} />
              การติดตาม
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="followUpRequired"
                checked={formData.followUpRequired}
                onCheckedChange={(checked) => {
                  handleInputChange('followUpRequired', checked);
                  if (!checked) {
                    handleInputChange('followUpDate', '');
                  }
                }}
              />
              <Label htmlFor="followUpRequired">ต้องมีการติดตามผล</Label>
            </div>
            {formData.followUpRequired && (
              <div>
                <Label htmlFor="followUpDate">วันที่ควรติดตาม</Label>
                <Input
                  id="followUpDate"
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? 'กำลังบันทึก...' : 'บันทึกงานทั้งแปลง'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            ยกเลิก
          </Button>
        </div>
      </form>
    </div>
  );
}