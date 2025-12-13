"use client";

import React, { useState, useCallback, useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Save, Calculator } from 'lucide-react';
import { calculateMixingOrder } from '@/lib/mixing-calculator';
import type { ChemicalInput, MixingOrderResult } from '@/lib/mixing-calculator';

import { getAllChemicalTypes } from '@/lib/chemical-types';

// Get all available chemical types with labels
const CHEMICAL_TYPES = getAllChemicalTypes();

// Memoized chemical type options to prevent unnecessary recalculations
const ChemicalTypeOptions = memo(() => (
  <>
    {CHEMICAL_TYPES.map(type => (
      <SelectItem key={type.value} value={type.value} className="text-xs">
        {type.label}
      </SelectItem>
    ))}
  </>
));
ChemicalTypeOptions.displayName = 'ChemicalTypeOptions';

// Memoized chemical input row component for better performance
const ChemicalInputRow = memo<{
  chemical: ChemicalInput;
  index: number;
  totalChemicals: number;
  onUpdate: (index: number, field: keyof ChemicalInput, value: string | number) => void;
  onRemove: (index: number) => void;
}>(({ chemical, index, totalChemicals, onUpdate, onRemove }) => (
  <div className="border border-gray-200 rounded-lg p-3 space-y-3">
    <div className="flex items-center justify-between">
      <Label className="text-sm font-medium">สารเคมี #{index + 1}</Label>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onRemove(index)}
        disabled={totalChemicals === 1}
        className="h-8 w-8 p-0"
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="lg:col-span-2">
        <Label htmlFor={`chemical-name-${index}`} className="text-xs">ชื่อสารเคมี</Label>
        <Input
          id={`chemical-name-${index}`}
          value={chemical.name}
          onChange={(e) => onUpdate(index, 'name', e.target.value)}
          placeholder="เช่น ยาคุมหญ้า"
          className="text-sm"
          data-testid={`chemical-name-input-${index}`}
        />
      </div>

      <div>
        <Label htmlFor={`chemical-type-${index}`} className="text-xs">ประเภท</Label>
        <Select
          value={chemical.type}
          onValueChange={(value) => onUpdate(index, 'type', value)}
        >
          <SelectTrigger id={`chemical-type-${index}`} className="text-sm" data-testid={`chemical-type-select-${index}`}>
            <SelectValue placeholder="เลือก" />
          </SelectTrigger>
          <SelectContent>
            <ChemicalTypeOptions />
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor={`chemical-qty-${index}`} className="text-xs">ปริมาณ</Label>
        <Input
          id={`chemical-qty-${index}`}
          type="number"
          step="0.01"
          value={chemical.quantity || ''}
          onChange={(e) => onUpdate(index, 'quantity', parseFloat(e.target.value) || 0)}
          placeholder="0"
          className="text-sm"
          data-testid={`chemical-quantity-input-${index}`}
        />
      </div>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="sm:col-span-1">
        <Label htmlFor={`chemical-unit-${index}`} className="text-xs">หน่วย</Label>
        <Select
          value={chemical.unit}
          onValueChange={(value) => onUpdate(index, 'unit', value)}
        >
          <SelectTrigger id={`chemical-unit-${index}`} className="text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="มล." className="text-xs">มล.</SelectItem>
            <SelectItem value="ลิตร" className="text-xs">ลิตร</SelectItem>
            <SelectItem value="กรัม" className="text-xs">กรัม</SelectItem>
            <SelectItem value="กก." className="text-xs">กก.</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
));
ChemicalInputRow.displayName = 'ChemicalInputRow';

interface MixingCalculatorProps {
  orchardId: string;
  onSaveFormula?: (formula: {
    name: string;
    description?: string;
    components: ChemicalInput[];
  }) => Promise<void>;
}

export function MixingCalculator({ orchardId: _orchardId, onSaveFormula }: MixingCalculatorProps) {
  // _orchardId is available for future use when saving formulas to specific orchards
  const [chemicals, setChemicals] = useState<ChemicalInput[]>([
    { name: '', type: 'SL', quantity: 0, unit: 'มล.' }
  ]);
  const [result, setResult] = useState<MixingOrderResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formulaName, setFormulaName] = useState('');
  const [formulaDescription, setFormulaDescription] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  // Memoized handlers to prevent unnecessary re-renders
  const addChemical = useCallback(() => {
    setChemicals(prev => [...prev, { name: '', type: 'SL', quantity: 0, unit: 'มล.' }]);
  }, []);

  const removeChemical = useCallback((index: number) => {
    setChemicals(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateChemical = useCallback((index: number, field: keyof ChemicalInput, value: string | number) => {
    setChemicals(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  // Memoized valid chemicals filter to avoid unnecessary recalculations
  const validChemicals = useMemo(
    () => chemicals.filter(c => c.name && c.quantity > 0),
    [chemicals]
  );

  // Memoized calculation function
  const handleCalculate = useCallback(async () => {
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
  }, [validChemicals]);

  // Memoized save formula function
  const handleSaveFormula = useCallback(async () => {
    if (!formulaName.trim()) {
      alert('กรุณากรอกชื่อสูตร');
      return;
    }

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
  }, [formulaName, formulaDescription, validChemicals, onSaveFormula]);

  
  return (
    <div className="space-y-6" data-testid="mixing-calculator-form">
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
            <ChemicalInputRow
              key={index}
              chemical={chemical}
              index={index}
              totalChemicals={chemicals.length}
              onUpdate={updateChemical}
              onRemove={removeChemical}
            />
          ))}

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button type="button" variant="outline" onClick={addChemical} className="w-full sm:w-auto" data-testid="add-chemical-btn">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">เพิ่มสารเคมี</span>
              <span className="sm:hidden">เพิ่ม</span>
            </Button>

            <Button
              type="button"
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full sm:w-auto sm:ml-auto"
              data-testid="calculate-mixing-order-btn"
            >
              {isCalculating ? 'กำลังคำนวณ...' : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">คำนวณลำดับการผสม</span>
                  <span className="sm:hidden">คำนวณ</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <Card className="border-2 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
              <Calculator className="w-5 h-5 text-green-600" />
              ผลลัพธ์การคำนวณลำดับการผสม
            </CardTitle>
            <CardDescription className="text-sm md:text-base">
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
                      {step.description}
                    </div>
                    <div className="space-y-1">
                      {step.chemicals.map((chemical, chemIndex) => (
                        <div key={chemIndex} className="flex items-center justify-between bg-gray-50 rounded p-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{chemical.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {chemical.type}
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
                  data-testid="save-as-formula-btn"
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
                      data-testid="formula-name-input"
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
                      data-testid="formula-description-input"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleSaveFormula}
                      disabled={isSaving}
                      className="flex-1"
                      data-testid="confirm-save-formula-btn"
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