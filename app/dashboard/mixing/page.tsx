"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calculator, History, Plus } from 'lucide-react';
import { useOrchard } from '@/components/providers/orchard-provider';
import { MixingCalculator } from '@/components/mixing/MixingCalculator';
import { MixingHistory } from '@/components/mixing/MixingHistory';
import { MixingOrderDisplay, type MixingOrderDisplayResult } from '@/components/mixing/MixingOrderDisplay';
import { createGlobalMixingFormula } from '@/app/actions/mixing-formulas';
import { calculateMixingOrder } from '@/lib/mixing-calculator';
import type { MixingFormula } from '@prisma/client';
import type { ChemicalInput } from '@/lib/mixing-calculator';

type MixingView = 'calculator' | 'history' | 'result';

type FormulaWithComponents = MixingFormula & {
  components: {
    name: string;
    type: string;
    quantity: number;
    unit: string;
    formulaType?: string;
    step: number;
  }[];
};

export default function MixingPage() {
  const router = useRouter();
  const { currentOrchard } = useOrchard();
  const [view, setView] = useState<MixingView>('calculator');
  const [selectedFormula, setSelectedFormula] = useState<FormulaWithComponents | null>(null);
  const [calculationResult, setCalculationResult] = useState<MixingOrderDisplayResult | null>(null);
  const [chemicals, setChemicals] = useState<ChemicalInput[]>([]);

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleSelectFormula = (formula: FormulaWithComponents) => {
    try {
      // Convert formula components to ChemicalInput format
      const chemicalInputs: ChemicalInput[] = formula.components.map(comp => ({
        name: comp.name,
        type: comp.type as ChemicalInput['type'],
        quantity: comp.quantity,
        unit: comp.unit
      }));

      const result = calculateMixingOrder(chemicalInputs);
      setSelectedFormula(formula);
      setChemicals(chemicalInputs);
      setCalculationResult(result);
      setView('result');
    } catch (error) {
      console.error('Error calculating formula:', error);
      alert('เกิดข้อผิดพลาดในการคำนวณสูตร');
    }
  };

  const handleSaveFormula = async (formulaData: {
    name: string;
    description?: string;
    components: ChemicalInput[];
  }) => {
    try {
      const result = await createGlobalMixingFormula({
        name: formulaData.name,
        description: formulaData.description,
        components: formulaData.components.map((c, index) => ({
          ...c,
          step: index + 1
        }))
      });

      if (result.success) {
        alert('บันทึกสูตรสำเร็จแล้ว');
      } else {
        alert('บันทึกสูตรไม่สำเร็จ: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving formula:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกสูตร');
    }
  };

  
  if (!currentOrchard) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" onClick={handleBackToDashboard}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold">ผสมสารเคมี</h1>
          </div>

          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600 mb-4">กรุณาเลือกสวนก่อนใช้งานฟีเจอร์นี้</p>
              <Button onClick={handleBackToDashboard}>กลับไปหน้าแรก</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 pb-24 md:p-4 md:pb-8 w-full lg:max-w-6xl lg:mx-auto" data-testid="mixing-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" onClick={handleBackToDashboard} size="sm" data-testid="back-to-dashboard-btn">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="text-center sm:text-left">
            <h1 className="text-xl md:text-2xl font-bold">ผสมสารเคมี</h1>
            <p className="text-sm md:text-base text-gray-600">{currentOrchard.name}</p>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row gap-1 p-1 bg-gray-100 rounded-lg" data-testid="dashboard-tabs">
          <button
            onClick={() => setView('calculator')}
            data-testid="tab-calculator"
            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2 rounded-md transition-colors text-xs sm:text-sm ${
              view === 'calculator'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calculator className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">คำนวณสูตร</span>
            <span className="sm:hidden">คำนวณ</span>
          </button>
          <button
            onClick={() => setView('history')}
            data-testid="tab-mixing"
            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2 rounded-md transition-colors text-xs sm:text-sm ${
              view === 'history'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <History className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">ประวัติสูตร</span>
            <span className="sm:hidden">ประวัติ</span>
          </button>
          {view === 'result' && (
            <button
              onClick={() => setView('result')}
              className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2 rounded-md transition-colors bg-white text-gray-900 shadow-sm text-xs sm:text-sm`}
            >
              ผลลัพธ์
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div>
        {view === 'calculator' && (
          <div data-testid="mixing-calculator">
            <MixingCalculator
              onSaveFormula={handleSaveFormula}
            />
          </div>
        )}

        {view === 'history' && (
          <div data-testid="mixing-history">
            <MixingHistory
              onSelectFormula={handleSelectFormula}
              onShowCalculator={() => setView('calculator')}
            />
          </div>
        )}

        {view === 'result' && calculationResult && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">ผลลัพธ์การคำนวณ</h2>
              <Button
                variant="outline"
                onClick={() => setView('calculator')}
              >
                <Plus className="w-4 h-4 mr-2" />
                คำนวณใหม่
              </Button>
            </div>

            <MixingOrderDisplay
              result={calculationResult}
              chemicals={chemicals}
              formulaName={selectedFormula?.name}
              formulaDescription={selectedFormula?.description || undefined}
              onSave={selectedFormula ? undefined : () => setView('calculator')}
            />
          </div>
        )}
      </div>
    </div>
  );
}