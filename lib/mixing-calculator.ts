// Re-export types from helpers
export type {
  ChemicalType,
  ChemicalInput,
  MixingOrderStep,
  MixingOrderResult
} from '@/tests/helpers/chemical-mixing'

import type { ChemicalInput, MixingOrderResult } from '@/tests/helpers/chemical-mixing'
import { isOldChemicalType, migrateChemicalType } from '@/constants/chemical-formulations'

/**
 * Map chemical type to mixing step based on 7-step academic process
 */
function mapChemicalTypeToStep(type: string): number {
  // Handle old types directly without migration for backward compatibility
  switch (type) {
    // Old types - map to their original steps
    case 'chelator':
      return 1
    case 'suspended':
      return 2
    case 'liquid':
      return 3
    case 'fertilizer':
      return 4
    case 'adjuvant':
      return 5
    case 'oil_concentrate':
      return 6
    case 'oil':
      return 7
  }

  // Handle new types
  switch (type) {
    // Step 1: Chelators (SC - Suspension Concentrate for chelated micronutrients)
    case 'SC':
      return 1

    // Step 2: Suspended/Wettable powders (sorted by quantity)
    case 'WP':   // Wettable Powder
    case 'WDG':  // Water Dispersible Granule
    case 'DF':   // Dustable Formulation
    case 'FDF':  // Flowable Dust-Free Powder
    case 'WG':   // Water Granule
      return 2

    // Step 3: Soluble liquids
    case 'SL':   // Soluble Liquid
    case 'LIQ_FERT': // Liquid Fertilizer
      return 3

    // Step 4: Fertilizers
    case 'FERT': // Fertilizer
    case 'ORG':  // Organic Fertilizer
      return 4

    // Step 5: Adjuvants (Surfactants, Stickers, Spreaders)
    case 'SURF':  // Surfactant
    case 'STICK': // Sticker
    case 'SPREAD': // Spreader
    case 'SE':    // Suspo Emulsion (often contains adjuvants)
      return 5

    // Step 6: Oil concentrates
    case 'EC': // Emulsifiable Concentrate
      return 6

    // Step 7: Oils
    case 'ME':  // Micro Emulsion
    case 'EW':  // Emulsion in Water
    case 'FS':  // Flowable Concentrate (often oil-based)
    case 'CS':  // Capsule Suspension (oil-based)
      return 7

    // Granules - can be added at step 2 or 4
    case 'GR':  // Granule
      return 4

    // Unknown - default to step 7 (last)
    default:
      return 7
  }
}

export const calculateMixingOrder = (chemicals: ChemicalInput[]): MixingOrderResult => {
  // Group by mixing step
  const grouped = chemicals.reduce((acc, chemical) => {
    const step = mapChemicalTypeToStep(chemical.type)
    if (!acc[step]) acc[step] = []
    acc[step].push(chemical)
    return acc
  }, {} as Record<number, ChemicalInput[]>)

  // Sort chemicals within step 2 (powders) by quantity (น้อย -> มาก)
  if (grouped[2]) {
    grouped[2].sort((a, b) => a.quantity - b.quantity)
  }

  // Generate warnings based on chemical types
  const warnings = []

  // Check for powders that need pre-wetting
  const powderTypes = ['WP', 'WDG', 'DF', 'FDF', 'WG', 'suspended']
  if (chemicals.some(c => powderTypes.includes(c.type))) {
    warnings.push('ละลายยาที่เป็นผงในน้ำเล็กน้อยก่อนนำไปผสม')
  }

  // Check for fertilizers
  const fertilizerTypes = ['FERT', 'ORG', 'GR', 'fertilizer']
  if (chemicals.some(c => fertilizerTypes.includes(c.type))) {
    warnings.push('ละลายปุ๋ยให้หมดก่อนนำไปผสมกับสารอื่น')
  }

  // Build 8-step mixing order (including step 0 for เตรียมน้ำ)
  // Use array indices starting from 0 for backward compatibility with tests
  const steps = [
    { step: 0, description: 'เตรียมน้ำ', chemicals: [] },
    { step: 1, description: 'สารคีเลต/สารอินทรีย์', chemicals: grouped[1] || [] },
    { step: 2, description: 'สารแขวนลอย', chemicals: grouped[2] || [] },
    { step: 3, description: 'สารละลายน้ำใส', chemicals: grouped[3] || [] },
    { step: 4, description: 'ปุ๋ยมีประจุ', chemicals: grouped[4] || [] },
    { step: 5, description: 'สารจับใบ', chemicals: grouped[5] || [] },
    { step: 6, description: 'สารละลายน้ำมัน', chemicals: grouped[6] || [] },
    { step: 7, description: 'ออยล์', chemicals: grouped[7] || [] },
  ];

  const totalSteps = steps.length
  const waterAmount = chemicals.reduce((total, chem) => total + chem.quantity, 0) * 20 // Estimate water

  return {
    steps,
    warnings,
    totalSteps,
    estimatedTime: `${Math.max(5, totalSteps * 2)} นาที`,
    waterAmount
  }
}

/**
 * Get Thai description for each mixing step
 */
function getStepDescription(step: number): string {
  const descriptions = [
    '',
    '1. ใส่สารคีเลต/สารอินทรีย์',
    '2. ใส่สารแขวนตะกอน (เรียงจากน้อยไปมาก)',
    '3. ใส่สารละลายน้ำ',
    '4. ใส่ปุ๋ย',
    '5. ใส่สารควบคุม',
    '6. ใส่น้ำมันเข้มข้น',
    '7. ใส่น้ำมัน'
  ]
  return descriptions[step - 1] || `ขั้นที่ ${step}`
}