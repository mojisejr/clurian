/**
 * Agricultural Chemical Mixing Order Calculator
 *
 * Implements the academic 7-step mixing process for agricultural chemicals
 * following Thai agricultural extension guidelines. The order of mixing
 * is critical to prevent chemical reactions and ensure effectiveness.
 */

// Re-export types from helpers
export type {
  ChemicalType,
  ChemicalInput,
  MixingOrderStep,
  MixingOrderResult
} from '@/tests/helpers/chemical-mixing'

import type { ChemicalInput, MixingOrderResult } from '@/tests/helpers/chemical-mixing'

// === Chemical Step Mapping ===
// Maps chemical formulations to their mixing steps based on solubility
// and compatibility with other chemicals

/** Mapping of chemical types to mixing steps for optimal compatibility */
const CHEMICAL_STEP_MAP: Readonly<Record<string, number>> = {
  // Legacy types (for backward compatibility)
  'chelator': 1,
  'suspended': 2,
  'liquid': 3,
  'fertilizer': 4,
  'adjuvant': 5,
  'oil_concentrate': 6,
  'oil': 7,

  // Step 1: Chelators and organic amendments
  'SC': 1,

  // Step 2: Powders and dry formulations (need pre-wetting)
  'WP': 2,     // Wettable Powder
  'WDG': 2,    // Water Dispersible Granule
  'DF': 2,     // Dustable Formulation
  'FDF': 2,    // Flowable Dust-Free Powder
  'WG': 2,     // Water Granule

  // Step 3: Water-soluble liquids
  'SL': 3,         // Soluble Liquid
  'LIQ_FERT': 3,   // Liquid Fertilizer

  // Step 4: Fertilizers (solid and organic)
  'FERT': 4,   // Chemical Fertilizer
  'ORG': 4,    // Organic Fertilizer
  'GR': 4,     // Granule (placed at step 4 for better dissolution)

  // Step 5: Adjuvants and surface-active agents
  'SURF': 5,   // Surfactant
  'STICK': 5,  // Sticker
  'SPREAD': 5, // Spreader
  'SE': 5,     // Suspo Emulsion (contains adjuvants)

  // Step 6: Oil-based concentrates
  'EC': 6,     // Emulsifiable Concentrate

  // Step 7: Final oils and oil-based formulations
  'ME': 7,     // Micro Emulsion
  'EW': 7,     // Emulsion in Water
  'FS': 7,     // Flowable Concentrate
  'CS': 7,     // Capsule Suspension
} as const;

/**
 * Determine the mixing step for a chemical based on its formulation type
 *
 * @param type - The chemical formulation type (legacy or standard)
 * @returns The mixing step number (1-7)
 */
function mapChemicalTypeToStep(type: string): number {
  // Use the mapping table for consistent and maintainable step assignment
  return CHEMICAL_STEP_MAP[type] ?? 7; // Default to step 7 for unknown types
}

// === Warning Generation ===
// Chemical types that require special handling warnings

/** Chemical types that need pre-wetting to prevent clumping */
const POWDER_TYPES = new Set<string>([
  'WP',     // Wettable Powder
  'WDG',    // Water Dispersible Granule
  'DF',     // Dustable Formulation
  'FDF',    // Flowable Dust-Free Powder
  'WG',     // Water Granule
  'suspended' // Legacy type
]);

/** Chemical types that are fertilizers requiring complete dissolution */
const FERTILIZER_TYPES = new Set<string>([
  'FERT',       // Chemical Fertilizer
  'ORG',        // Organic Fertilizer
  'GR',         // Granule
  'fertilizer'  // Legacy type
]);

/** Step descriptions in Thai for user interface */
const STEP_DESCRIPTIONS = [
  { step: 0, description: 'เตรียมน้ำ', chemicals: [] },
  { step: 1, description: 'สารคีเลต/สารอินทรีย์', chemicals: [] },
  { step: 2, description: 'สารแขวนลอย', chemicals: [] },
  { step: 3, description: 'สารละลายน้ำใส', chemicals: [] },
  { step: 4, description: 'ปุ๋ยมีประจุ', chemicals: [] },
  { step: 5, description: 'สารจับใบ', chemicals: [] },
  { step: 6, description: 'สารละลายน้ำมัน', chemicals: [] },
  { step: 7, description: 'ออยล์', chemicals: [] },
] as const;

/**
 * Generate appropriate warnings based on the chemical types present
 *
 * @param chemicals - Array of chemical inputs
 * @returns Array of warning messages in Thai
 */
function generateWarnings(chemicals: ReadonlyArray<ChemicalInput>): string[] {
  const warnings: string[] = [];

  // Check for powders that need pre-wetting
  const hasPowders = chemicals.some(c => POWDER_TYPES.has(c.type));
  if (hasPowders) {
    warnings.push('ละลายยาที่เป็นผงในน้ำเล็กน้อยก่อนนำไปผสม');
  }

  // Check for fertilizers
  const hasFertilizers = chemicals.some(c => FERTILIZER_TYPES.has(c.type));
  if (hasFertilizers) {
    warnings.push('ละลายปุ๋ยให้หมดก่อนนำไปผสมกับสารอื่น');
  }

  return warnings;
}

/**
 * Calculate the optimal mixing order for agricultural chemicals
 *
 * This function implements the academic 7-step mixing process following
 * Thai agricultural extension guidelines. The order ensures chemical
 * compatibility and prevents adverse reactions.
 *
 * @param chemicals - Array of chemicals to mix with their properties
 * @returns Complete mixing plan with steps, warnings, and timing estimates
 *
 * @example
 * ```typescript
 * const chemicals = [
 *   { name: 'ยาคุมหญ้า', type: 'WP', quantity: 50, unit: 'กรัม' },
 *   { name: 'ปุ๋ยเคมี', type: 'FERT', quantity: 20, unit: 'กก.' }
 * ];
 * const plan = calculateMixingOrder(chemicals);
 * ```
 */
export const calculateMixingOrder = (chemicals: ReadonlyArray<ChemicalInput>): MixingOrderResult => {
  // Group chemicals by their mixing steps
  const groupedByStep = chemicals.reduce<Record<number, ChemicalInput[]>>((acc, chemical) => {
    const step = mapChemicalTypeToStep(chemical.type);

    // Initialize step array if needed
    if (!acc[step]) {
      acc[step] = [];
    }

    acc[step].push(chemical);
    return acc;
  }, {});

  // Sort powders (step 2) by quantity - smallest first for better dissolution
  if (groupedByStep[2]) {
    groupedByStep[2].sort((a, b) => a.quantity - b.quantity);
  }

  // Generate appropriate warnings
  const warnings = generateWarnings(chemicals);

  // Build the complete mixing steps with assigned chemicals
  const steps = STEP_DESCRIPTIONS.map(step => ({
    ...step,
    chemicals: groupedByStep[step.step] || []
  }));

  // Calculate additional metrics
  const totalSteps = steps.length;
  const totalQuantity = chemicals.reduce((sum, chem) => sum + chem.quantity, 0);
  const waterAmount = totalQuantity * 20; // Estimate: 1L water per 50g chemical
  const estimatedMinutes = Math.max(5, totalSteps * 2); // Minimum 5 minutes

  return {
    steps,
    warnings,
    totalSteps,
    estimatedTime: `${estimatedMinutes} นาที`,
    waterAmount
  };
};

