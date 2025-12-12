"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Save, Calculator } from 'lucide-react';
import { calculateMixingOrder } from '@/lib/mixing-calculator';
import type { ChemicalInput, MixingOrderResult } from '@/lib/mixing-calculator';

const CHEMICAL_TYPES = [
  { value: 'chelator', label: 'สาร Chelator' },
  { value: 'suspended', label: 'สารแขวนตะกอน' },
  { value: 'liquid', label: 'สารละลายน้ำ' },
  { value: 'fertilizer', label: 'ปุ๋ย' },
  { value: 'adjuvant', label: 'สารควบคุม' },
  { value: 'oil_concentrate', label: 'น้ำมันเข้มข้น' },
  { value: 'oil', label: 'น้ำมัน' }
] as const;

interface MixingCalculatorProps {
  orchardId: string;
  onSaveFormula?: (formula: {
    name: string;
    description?: string;
    components: ChemicalInput[];
  }) => Promise<void>;
}

export function MixingCalculator({ orchardId: _orchardId, onSaveFormula }: MixingCalculatorProps) {
  const [chemicals, setChemicals] = useState<ChemicalInput[]>([
    { name: '', type: 'liquid', quantity: 0, unit: 'มล.' }
  ]);
  const [result, setResult] = useState<MixingOrderResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formulaName, setFormulaName] = useState('');
  const [formulaDescription, setFormulaDescription] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  const addChemical = () => {
    setChemicals([...chemicals, { name: '', type: 'liquid', quantity: 0, unit: 'มล.' }]);
  };

  const removeChemical = (index: number) => {
    setChemicals(chemicals.filter((_, i) => i !== index));
  };

  const updateChemical = (index: number, field: keyof ChemicalInput, value: string | number) => {
    const updated = [...chemicals];
    updated[index] = { ...updated[index], [field]: value };
    setChemicals(updated);
  };

  const handleCalculate = async () => {
    const validChemicals = chemicals.filter(c => c.name && c.quantity > 0);

    if (validChemicals.length === 0) {
      alert('กรุณาเพิ่มสารเคมีอย่างน้อย 1 ชนิด');
      return;
    }

    setIsCalculating(true);
    try {
      const mixingResult = calculateMixingOrder(validChemicals);
      setResult(mixingResult);
    } catch (error) {
      console.error('Calculation error:', error);
      alert('เกิดข้อผิดพลาดในการคำนวณ');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSaveFormula = async () => {
    if (!formulaName.trim()) {
      alert('กรุณากรอกชื่อสูตร');
      return;
    }

    const validChemicals = chemicals.filter(c => c.name && c.quantity > 0);

    if (validChemicals.length === 0) {
      alert('กรุณาเพิ่มสารเคมีอย่างน้อย 1 ชนิด');
      return;
    }

    setIsSaving(true);
    try {
      await onSaveFormula?.({
        name: formulaName,
        description: formulaDescription,
        components: validChemicals
      });

      // Reset form
      setFormulaName('');
      setFormulaDescription('');
      setShowSaveForm(false);
      alert('บันทึกสูตรสำเร็จแล้ว');
    } catch (error) {
      console.error('Save error:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกสูตร');
    } finally {
      setIsSaving(false);
    }
  };

  const getStepLabel = (step: number) => {
    const steps = [
      '1. ใส่สาร Chelator',
      '2. ใส่สารแขวนตะกอน (เรียงจากน้อยไปมาก)',
      '3. ใส่สารละลายน้ำ',
      '4. ใส่ปุ๋ย',
      '5. ใส่สารควบคุม',
      '6. ใส่น้ำมันเข้มข้น',
      '7. ใส่น้ำมัน'
    ];
    return steps[step - 1] || `ขั้นที่ ${step}`;
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            คำนวณลำดับการผสมสารเคมี
          </CardTitle>
          <CardDescription>
            เพิ่มสารเคมีที่ต้องการผสม ระบบจะคำนวณลำดับการผสมที่เหมาะสมที่สุด (7 ขั้นตอน)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {chemicals.map((chemical, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-4">
                <Label htmlFor={`chemical-name-${index}`}>ชื่อสารเคมี</Label>
                <Input
                  id={`chemical-name-${index}`}
                  value={chemical.name}
                  onChange={(e) => updateChemical(index, 'name', e.target.value)}
                  placeholder="เช่น ยาคุมหญ้า"
                />
              </div>

              <div className="col-span-3">
                <Label htmlFor={`chemical-type-${index}`}>ประเภท</Label>
                <Select
                  value={chemical.type}
                  onValueChange={(value) => updateChemical(index, 'type', value)}
                >
                  <SelectTrigger id={`chemical-type-${index}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHEMICAL_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor={`chemical-qty-${index}`}>ปริมาณ</Label>
                <Input
                  id={`chemical-qty-${index}`}
                  type="number"
                  step="0.01"
                  value={chemical.quantity || ''}
                  onChange={(e) => updateChemical(index, 'quantity', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor={`chemical-unit-${index}`}>หน่วย</Label>
                <Select
                  value={chemical.unit}
                  onValueChange={(value) => updateChemical(index, 'unit', value)}
                >
                  <SelectTrigger id={`chemical-unit-${index}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="มล.">มล.</SelectItem>
                    <SelectItem value="ลิตร">ลิตร</SelectItem>
                    <SelectItem value="กรัม">กรัม</SelectItem>
                    <SelectItem value="กก.">กก.</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeChemical(index)}
                  disabled={chemicals.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={addChemical}>
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มสารเคมี
            </Button>

            <Button
              type="button"
              onClick={handleCalculate}
              disabled={isCalculating}
              className="ml-auto"
            >
              {isCalculating ? 'กำลังคำนวณ...' : 'คำนวณลำดับการผสม'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>ผลลัพธ์การคำนวณลำดับการผสม</CardTitle>
            <CardDescription>
              ลำดับการผสมที่เหมาะสมที่สุดตามหลักวิชาการ (7 ขั้นตอน)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">⚠️ คำเตือน</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {result.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mixing Steps */}
              <div className="space-y-3">
                {result.steps.map((step, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                    <div className="font-medium text-green-800 mb-1">
                      {getStepLabel(parseInt(step.step))}
                    </div>
                    <div className="space-y-1">
                      {step.chemicals.map((chemical, chemIndex) => (
                        <div key={chemIndex} className="flex items-center justify-between bg-gray-50 rounded p-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{chemical.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {CHEMICAL_TYPES.find(t => t.value === chemical.type)?.label}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-600">
                            {chemical.quantity} {chemical.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Save Formula Button */}
              <div className="pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSaveForm(!showSaveForm)}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  บันทึกเป็นสูตร
                </Button>
              </div>

              {/* Save Formula Form */}
              {showSaveForm && (
                <div className="border-t pt-4 space-y-4">
                  <div>
                    <Label htmlFor="formula-name">ชื่อสูตร</Label>
                    <Input
                      id="formula-name"
                      value={formulaName}
                      onChange={(e) => setFormulaName(e.target.value)}
                      placeholder="เช่น สูตรคุมหญ้าโตเต็มวัย"
                    />
                  </div>

                  <div>
                    <Label htmlFor="formula-description">รายละเอียด (ถ้ามี)</Label>
                    <textarea
                      id="formula-description"
                      className="w-full p-2 border rounded-md text-sm"
                      rows={3}
                      value={formulaDescription}
                      onChange={(e) => setFormulaDescription(e.target.value)}
                      placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับสูตรนี้..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleSaveFormula}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      {isSaving ? 'กำลังบันทึก...' : 'บันทึกสูตร'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowSaveForm(false);
                        setFormulaName('');
                        setFormulaDescription('');
                      }}
                    >
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}