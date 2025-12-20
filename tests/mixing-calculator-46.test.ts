/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tests for Mixing Calculator with 46 Formulation Types (Issue #27)
 *
 * RED PHASE: These tests should FAIL because the mixing calculator
 * only knows about 27 types, not the full 46 types we need
 */

import { describe, it, expect } from 'vitest'
import { calculateMixingOrder } from '@/lib/mixing-calculator'
import type { ChemicalInput } from '@/tests/helpers/chemical-mixing'

describe('Mixing Calculator with 46 Formulation Types', () => {
  describe('New Critical Types Support', () => {
    it('should handle Soluble Powder (SP) correctly', () => {
      const chemicals: ChemicalInput[] = [
        { name: 'สารละลายผง', type: 'SP', quantity: 100, unit: 'g' }
      ]

      const result = calculateMixingOrder(chemicals)
      expect(result.steps[2].chemicals).toHaveLength(1) // Step 2: Powders
      expect(result.steps[2].chemicals[0].name).toBe('สารละลายผง')
    })

    it('should handle Soluble Granule (SG) correctly', () => {
      const chemicals: ChemicalInput[] = [
        { name: 'เม็ดละลายน้ำ', type: 'SG', quantity: 200, unit: 'g' }
      ]

      const result = calculateMixingOrder(chemicals)
      expect(result.steps[2].chemicals).toHaveLength(1) // Step 2: Powders
    })

    it('should handle Tree Paste (PA) correctly', () => {
      const chemicals: ChemicalInput[] = [
        { name: 'สารทาท่อ', type: 'PA', quantity: 500, unit: 'g' }
      ]

      const result = calculateMixingOrder(chemicals)
      expect(result.steps[4].chemicals).toHaveLength(1) // Step 4: Fertilizers
    })

    it('should handle Oil Dispersion (OD) correctly', () => {
      const chemicals: ChemicalInput[] = [
        { name: 'น้ำมันกระจาย', type: 'OD', quantity: 150, unit: 'ml' }
      ]

      const result = calculateMixingOrder(chemicals)
      expect(result.steps[7].chemicals).toHaveLength(1) // Step 7: Oils
    })

    it('should handle Zinc/Copper (ZC) correctly', () => {
      const chemicals: ChemicalInput[] = [
        { name: 'สังกะสี/ทองแดง', type: 'ZC', quantity: 50, unit: 'g' }
      ]

      const result = calculateMixingOrder(chemicals)
      expect(result.steps[2].chemicals).toHaveLength(1) // Step 2: Powders
    })

    it('should handle Drone Formulation (UL) correctly', () => {
      const chemicals: ChemicalInput[] = [
        { name: 'สารสำหรับโดรน', type: 'UL', quantity: 5, unit: 'L' }
      ]

      const result = calculateMixingOrder(chemicals)
      expect(result.steps[3].chemicals).toHaveLength(1) // Step 3: Liquids
    })

    it('should handle Gas Generator (GE) correctly', () => {
      const chemicals: ChemicalInput[] = [
        { name: 'แก๊สฆ่าแมลง', type: 'GE', quantity: 10, unit: 'unit' }
      ]

      const result = calculateMixingOrder(chemicals)
      expect(result.steps[4].chemicals).toHaveLength(1) // Step 4: Special case
    })

    it('should handle Granular Bait (GB) correctly', () => {
      const chemicals: ChemicalInput[] = [
        { name: 'เหยื่อเม็ด', type: 'GB', quantity: 1, unit: 'kg' }
      ]

      const result = calculateMixingOrder(chemicals)
      expect(result.steps[4].chemicals).toHaveLength(1) // Step 4: Fertilizers
    })
  })

  describe('Complex Mixing Scenarios with All Types', () => {
    it('should handle a complete orchard spray mix with all 46 types', () => {
      // Create chemicals covering all critical new types
      const chemicals: ChemicalInput[] = [
        // Step 1: Chelators
        { name: 'EDTA', type: 'SC', quantity: 100, unit: 'g' },

        // Step 2: Powders (new types included)
        { name: 'ยา WP', type: 'WP', quantity: 200, unit: 'g' },
        { name: 'ยา SP', type: 'SP', quantity: 150, unit: 'g' },
        { name: 'ยา SG', type: 'SG', quantity: 300, unit: 'g' },
        { name: 'สังกะสี', type: 'ZC', quantity: 50, unit: 'g' },

        // Step 3: Liquids (new types included)
        { name: 'ยาละลายน้ำ', type: 'SL', quantity: 200, unit: 'ml' },
        { name: 'ยา UL', type: 'UL', quantity: 5, unit: 'L' },

        // Step 4: Fertilizers (new types included)
        { name: 'ปุ๋ย NPK', type: 'FERT', quantity: 500, unit: 'g' },
        { name: 'สารทาท่อ', type: 'PA', quantity: 200, unit: 'g' },
        { name: 'เหยื่อเม็ด', type: 'GB', quantity: 1, unit: 'kg' },

        // Step 5: Adjuvants
        { name: 'สารจับใบ', type: 'SURF', quantity: 50, unit: 'ml' },

        // Step 6: Oil concentrates
        { name: 'ยา EC', type: 'EC', quantity: 100, unit: 'ml' },

        // Step 7: Oils (new types included)
        { name: 'น้ำมัน OD', type: 'OD', quantity: 150, unit: 'ml' },
        { name: 'น้ำมัน ME', type: 'ME', quantity: 200, unit: 'ml' }
      ]

      const result = calculateMixingOrder(chemicals)

      // Verify each step has correct chemicals
      expect(result.steps[1].chemicals).toHaveLength(1) // EDTA
      expect(result.steps[2].chemicals).toHaveLength(4) // Powders
      expect(result.steps[3].chemicals).toHaveLength(2) // Liquids
      expect(result.steps[4].chemicals).toHaveLength(3) // Fertilizers
      expect(result.steps[5].chemicals).toHaveLength(1) // Adjuvant
      expect(result.steps[6].chemicals).toHaveLength(1) // EC
      expect(result.steps[7].chemicals).toHaveLength(2) // Oils

      // Should generate appropriate warnings
      expect(result.warnings).toContain('ละลายยาที่เป็นผงในน้ำเล็กน้อยก่อนนำไปผสม')
      expect(result.warnings).toContain('ละลายปุ๋ยให้หมดก่อนนำไปผสมกับสารอื่น')
    })

    it('should handle powder sorting by quantity with new types', () => {
      const chemicals: ChemicalInput[] = [
        { name: 'ผงขนาดใหญ่', type: 'SP', quantity: 500, unit: 'g' },
        { name: 'ผงขนาดกลาง', type: 'SG', quantity: 300, unit: 'g' },
        { name: 'ผงขนาดเล็ก', type: 'ZC', quantity: 50, unit: 'g' },
        { name: 'ผงขนาดเล็กมาก', type: 'WP', quantity: 25, unit: 'g' }
      ]

      const result = calculateMixingOrder(chemicals)
      const powders = result.steps[2].chemicals

      // Should be sorted by quantity (smallest first)
      expect(powders[0].quantity).toBe(25)
      expect(powders[0].type).toBe('WP')
      expect(powders[1].quantity).toBe(50)
      expect(powders[1].type).toBe('ZC')
      expect(powders[2].quantity).toBe(300)
      expect(powders[2].type).toBe('SG')
      expect(powders[3].quantity).toBe(500)
      expect(powders[3].type).toBe('SP')
    })
  })

  describe('Safety Validation for New Types', () => {
    it('should generate correct warnings for new powder types', () => {
      const chemicals: ChemicalInput[] = [
        { name: 'ผงละลายน้ำ', type: 'SP', quantity: 100, unit: 'g' },
        { name: 'เม็ดละลายน้ำ', type: 'SG', quantity: 200, unit: 'g' },
        { name: 'ไมโครเกรนูล', type: 'MG', quantity: 50, unit: 'g' }
      ]

      const result = calculateMixingOrder(chemicals)

      // All are powders/granules that need pre-wetting
      expect(result.warnings).toContain('ละลายยาที่เป็นผงในน้ำเล็กน้อยก่อนนำไปผสม')
    })

    it('should handle drone formulations (UL) with special timing', () => {
      const chemicals: ChemicalInput[] = [
        { name: 'สารโดรน', type: 'UL', quantity: 10, unit: 'L' },
        { name: 'ปุ๋ย', type: 'FERT', quantity: 1, unit: 'kg' }
      ]

      const result = calculateMixingOrder(chemicals)

      // UL should mix after fertilizer but before adjuvants
      expect(result.steps[3].chemicals).toHaveLength(1) // UL
      expect(result.steps[3].chemicals[0].type).toBe('UL')
      expect(result.steps[4].chemicals).toHaveLength(1) // Fertilizer
    })

    it('should handle gas generators (GE) safely', () => {
      const chemicals: ChemicalInput[] = [
        { name: 'แก๊ส', type: 'GE', quantity: 5, unit: 'unit' },
        { name: 'ยาฆ่าแมลง', type: 'EC', quantity: 100, unit: 'ml' }
      ]

      const result = calculateMixingOrder(chemicals)

      // GE should mix in step 4 (fertilizer step) as special case
      expect(result.steps[4].chemicals).toHaveLength(1)
      expect(result.steps[4].chemicals[0].type).toBe('GE')
    })
  })

  describe('Thai Agricultural Use Cases', () => {
    it('should handle durian orchard typical spray program', () => {
      // Typical durian orchard chemical mix
      const durianMix: ChemicalInput[] = [
        { name: 'EDTA', type: 'SC', quantity: 100, unit: 'g' },           // Micronutrient
        { name: 'ยากำจัดรา WP', type: 'WP', quantity: 300, unit: 'g' },    // Fungicide
        { name: 'ยากำจัดแมลง SP', type: 'SP', quantity: 200, unit: 'g' },  // Insecticide
        { name: 'สังกะสีซัลเฟต', type: 'ZC', quantity: 100, unit: 'g' },   // Micronutrient
        { name: 'ปุ๋ย NPK', type: 'FERT', quantity: 1, unit: 'kg' },       // Fertilizer
        { name: 'สารทาท่อ PA', type: 'PA', quantity: 500, unit: 'g' },      // Tree paste
        { name: 'สารจับใบ', type: 'SURF', quantity: 50, unit: 'ml' },       // Sticker
        { name: 'ยา EC', type: 'EC', quantity: 200, unit: 'ml' }            // Emulsifiable
      ]

      const result = calculateMixingOrder(durianMix)

      // Verify mixing order follows 7-step process
      expect(result.totalSteps).toBe(8)
      expect(result.estimatedTime).toBeDefined()
      expect(result.waterAmount).toBeGreaterThan(0)

      // Check specific step assignments
      expect(result.steps[1].chemicals[0].type).toBe('SC')  // Chelators first
      expect(result.steps[2].chemicals).toHaveLength(3)    // All powders
      expect(result.steps[4].chemicals).toHaveLength(2)    // Fertilizers & tree paste
      expect(result.steps[6].chemicals).toHaveLength(1)    // Emulsifiable Concentrate
    })

    it('should handle organic farming spray program', () => {
      // Organic farming typical mix
      const organicMix: ChemicalInput[] = [
        { name: 'สารสกัดพืช', type: 'SL', quantity: 500, unit: 'ml' },     // Botanical extract
        { name: 'ปุ๋ยอินทรีย์', type: 'ORG', quantity: 2, unit: 'kg' },     // Organic fertilizer
        { name: 'สารจับใบออร์แกนิค', type: 'STIK', quantity: 100, unit: 'ml' } // Organic sticker
      ]

      const result = calculateMixingOrder(organicMix)

      expect(result.steps[3].chemicals[0].type).toBe('SL')  // Soluble liquid
      expect(result.steps[4].chemicals[0].type).toBe('ORG') // Organic fertilizer
      expect(result.steps[5].chemicals[0].type).toBe('STIK') // Sticker
    })

    it('should handle seed treatment program', () => {
      // Seed treatment chemicals
      const seedMix: ChemicalInput[] = [
        { name: 'สารป้องกันเชื้อรา', type: 'WS', quantity: 100, unit: 'g' },   // Water soluble
        { name: 'ยาเม็ดปุ๋มพันธุ์', type: 'MG', quantity: 50, unit: 'g' },    // Micro granule
        { name: 'สารคลุมเมล็ด', type: 'PA', quantity: 200, unit: 'g' }        // Paste coating
      ]

      const result = calculateMixingOrder(seedMix)

      expect(result.steps[2].chemicals).toHaveLength(2)  // WS and MG are powders
      expect(result.steps[4].chemicals[0].type).toBe('PA') // Paste goes with fertilizers
    })
  })

  describe('Edge Cases with New Types', () => {
    it('should handle unknown new types by defaulting to step 7', () => {
      // This will fail until we add the new type to CHEMICAL_STEP_MAP
      const chemicals: ChemicalInput[] = [
        { name: 'สารใหม่ๆ', type: 'XX' as any, quantity: 100, unit: 'ml' }
      ]

      const result = calculateMixingOrder(chemicals)

      // Unknown types should default to step 7 (oils)
      expect(result.steps[7].chemicals).toHaveLength(1)
      expect(result.steps[7].chemicals[0].type).toBe('XX')
    })

    it('should handle mixed formulation combinations', () => {
      const chemicals: ChemicalInput[] = [
        { name: 'ผง+ของเหลว', type: 'WP-SC', quantity: 250, unit: 'g' },
        { name: 'น้ำมัน+เม็ด', type: 'EC-ME', quantity: 300, unit: 'ml' }
      ]

      const result = calculateMixingOrder(chemicals)

      // Combined formulations should have appropriate step assignments
      expect(result.steps[2].chemicals[0].type).toBe('WP-SC') // Powder-based
      expect(result.steps[7].chemicals[0].type).toBe('EC-ME')  // Oil-based
    })
  })
})