"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calculator, History, Plus } from 'lucide-react';
import { useOrchard } from '@/components/providers/orchard-provider';
import { MixingCalculator } from '@/components/mixing/MixingCalculator';
import { MixingHistory } from '@/components/mixing/MixingHistory';
import { MixingOrderDisplay } from '@/components/mixing/MixingOrderDisplay';
import { createMixingFormula } from '@/app/actions/mixing-formulas';
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
  const { currentOrchardId, currentOrchard } = useOrchard();
  const [view, setView] = useState<MixingView>('calculator');
  const [selectedFormula, setSelectedFormula] = useState<FormulaWithComponents | null>(null);
  const [calculationResult, setCalculationResult] = useState<any>(null);
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
    if (!currentOrchardId) {
      alert('ไม่พบข้อมูลสวน กรุณาลองใหม่อีกครั้ง');
      return;
    }

    try {
      const result = await createMixingFormula({
        orchardId: currentOrchardId,
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
    <div className="min-h-screen bg-gray-50 p-4 pb-24 md:pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={handleBackToDashboard}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">ผสมสารเคมี</h1>
            <p className="text-gray-600">{currentOrchard.name}</p>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="mb-6">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setView('calculator')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
              view === 'calculator'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calculator className="w-4 h-4" />
            คำนวณสูตร
          </button>
          <button
            onClick={() => setView('history')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
              view === 'history'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <History className="w-4 h-4" />
            ประวัติสูตร
          </button>
          {view === 'result' && (
            <button
              onClick={() => setView('result')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors bg-white text-gray-900 shadow-sm`}
            >
              ผลลัพธ์
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div>
        {view === 'calculator' && (
          <MixingCalculator
            orchardId={currentOrchardId}
            onSaveFormula={handleSaveFormula}
          />
        )}

        {view === 'history' && (
          <MixingHistory
            orchardId={currentOrchardId}
            onSelectFormula={handleSelectFormula}
            onShowCalculator={() => setView('calculator')}
          />
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