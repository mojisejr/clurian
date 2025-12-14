"use client";

import React, { useState, useCallback, useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Calculator } from 'lucide-react';
import { calculateMixingOrderFor200L } from '@/lib/mixing-calculator';
import type { ChemicalInput, MixingOrderResultFor200L } from '@/lib/mixing-calculator';

import { getAllChemicalTypes } from '@/lib/chemical-types';
import { ChemicalFormulationSelector } from '@/components/forms';
import {
  ChemicalFormulation,
  CHEMICAL_FORMULATIONS,
  isOldChemicalType,
  migrateChemicalType
} from '@/constants/chemical-formulations';

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
}>(({ chemical, index, totalChemicals, onUpdate, onRemove }) => {
  const [showAdvancedSelector, setShowAdvancedSelector] = useState(false);

  // Convert chemical type to proper formulation type for the selector
  const getFormulationType = (): ChemicalFormulation | undefined => {
    if (isOldChemicalType(chemical.type)) {
      return migrateChemicalType(chemical.type);
    }
    // Check if it's already a valid formulation type
    if (Object.values(CHEMICAL_FORMULATIONS).some((_, i) => {
      const types = Object.keys(CHEMICAL_FORMULATIONS) as ChemicalFormulation[];
      return types[i] === chemical.type;
    })) {
      return chemical.type as ChemicalFormulation;
    }
    return undefined;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">สารเคมี #{index + 1}</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedSelector(!showAdvancedSelector)}
            className="h-8 px-2 text-xs"
          >
            {showAdvancedSelector ? 'ซ่อนตัวเลือก' : 'ดูทั้งหมด'}
          </Button>
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

        {!showAdvancedSelector ? (
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
        ) : (
          <div className="lg:col-span-2">
            <Label className="text-xs">เลือกประเภทสารเคมี</Label>
            <div className="border border-gray-200 rounded-md p-2 max-h-40 overflow-y-auto">
              <ChemicalFormulationSelector
                onSelect={(type) => onUpdate(index, 'type', type)}
                selectedType={getFormulationType()}
                showTemplates={false}
                showFavorites={false}
                maxHeight="120px"
                className="border-none p-0"
              />
            </div>
          </div>
        )}

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

      {/* Advanced selector shown below the main inputs */}
      {showAdvancedSelector && (
        <div className="border-t pt-3">
          <ChemicalFormulationSelector
            onSelect={(type) => onUpdate(index, 'type', type)}
            selectedType={getFormulationType()}
            showTemplates={true}
            showFavorites={true}
            maxHeight="300px"
          />
        </div>
      )}
    </div>
  );
});
ChemicalInputRow.displayName = 'ChemicalInputRow';

interface MixingCalculatorProps {
  orchardId?: string;
  onSaveFormula?: (formula: {
    name: string;
    description?: string;
    components: ChemicalInput[];
  }) => Promise<void>;
}

interface MixingCalculatorProps {
  orchardId?: string;
  onSaveFormula?: (formula: {
    name: string;
    description?: string;
    components: ChemicalInput[];
  }) => Promise<void>;
  onCalculate?: (result: MixingOrderResultFor200L, chemicals: ChemicalInput[]) => void;
}

export function MixingCalculator({ onSaveFormula, onCalculate }: MixingCalculatorProps) {
  const [chemicals, setChemicals] = useState<ChemicalInput[]>([
    { name: '', type: 'SL', quantity: 0, unit: 'มล.' }
  ]);
  const [isCalculating, setIsCalculating] = useState(false);

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
      const mixingResult = calculateMixingOrderFor200L(validChemicals);
      onCalculate?.(mixingResult, validChemicals);
    } catch (error) {
      console.error('Calculation error:', error);
      alert('เกิดข้อผิดพลาดในการคำนวณ');
    } finally {
      setIsCalculating(false);
    }
  }, [validChemicals, onCalculate]);

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
    </div>
  );
}