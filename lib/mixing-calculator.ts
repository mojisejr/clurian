// Re-export types from helpers
export type {
  ChemicalType,
  ChemicalInput,
  MixingOrderStep,
  MixingOrderResult
} from '@/tests/helpers/chemical-mixing'

import type { ChemicalInput, MixingOrderResult } from '@/tests/helpers/chemical-mixing'

export const calculateMixingOrder = (chemicals: ChemicalInput[]): MixingOrderResult => {
  // Group by type
  const grouped = chemicals.reduce((acc, chemical) => {
    if (!acc[chemical.type]) acc[chemical.type] = []
    acc[chemical.type].push(chemical)
    return acc
  }, {} as Record<string, ChemicalInput[]>)

  // Sort suspended chemicals by quantity (น้อย -> มาก)
  if (grouped.suspended) {
    grouped.suspended.sort((a, b) => a.quantity - b.quantity)
  }

  // Generate warnings
  const warnings = []
  if (grouped.suspended) {
    warnings.push('ละลายยาที่เป็นผงในน้ำเล็กน้อยก่อนนำไปผสม')
  }
  if (grouped.fertilizer) {
    warnings.push('ละลายปุ๋ยให้หมดก่อนนำไปผสมกับสารอื่น')
  }

  const steps = [
    { step: 0, description: 'เตรียมน้ำ', chemicals: [] },
    { step: 1, description: 'สารคีเลต/สารอินทรีย์', chemicals: grouped.chelator || [] },
    { step: 2, description: 'สารแขวนลอย', chemicals: grouped.suspended || [] },
    { step: 3, description: 'สารละลายน้ำใส', chemicals: grouped.liquid || [] },
    { step: 4, description: 'ปุ๋ยมีประจุ', chemicals: grouped.fertilizer || [] },
    { step: 5, description: 'สารจับใบ', chemicals: grouped.adjuvant || [] },
    { step: 6, description: 'สารละลายน้ำมัน', chemicals: grouped.oil_concentrate || [] },
    { step: 7, description: 'ออยล์', chemicals: grouped.oil || [] },
  ];

  const totalSteps = steps.length;
  const waterAmount = chemicals.reduce((total, chem) => total + chem.quantity, 0) * 20; // Estimate water

  return {
    steps,
    warnings,
    totalSteps,
    estimatedTime: `${Math.max(5, totalSteps * 2)} นาที`,
    waterAmount
  }
}