import { describe, it, expect } from 'vitest'
import { calculateMixingOrder } from '@/lib/mixing-calculator'
import type { ChemicalInput } from '@/tests/helpers/chemical-mixing'

describe('Mixing Calculator', () => {
  describe('grouping chemicals by type', () => {
    it('should group chelator chemicals correctly', () => {
      const chemicals: ChemicalInput[] = [
        {
          name: 'EDTA',
          type: 'chelator',
          quantity: 100,
          unit: 'g',
          formulaType: 'SL'
        }
      ]

      const result = calculateMixingOrder(chemicals)

      expect(result.steps[1].step).toBe('1')
      expect(result.steps[1].description).toBe('สารคีเลต/สารอินทรีย์')
      expect(result.steps[1].chemicals).toHaveLength(1)
      expect(result.steps[1].chemicals[0].name).toBe('EDTA')
    })

    it('should group suspended chemicals correctly', () => {
      const chemicals: ChemicalInput[] = [
        {
          name: 'ยากำจัดแมลง WP',
          type: 'suspended',
          quantity: 200,
          unit: 'g',
          formulaType: 'WP'
        }
      ]

      const result = calculateMixingOrder(chemicals)

      expect(result.steps[2].step).toBe('2')
      expect(result.steps[2].description).toBe('สารแขวนลอย')
      expect(result.steps[2].chemicals).toHaveLength(1)
      expect(result.steps[2].chemicals[0].name).toBe('ยากำจัดแมลง WP')
    })

    it('should handle multiple chemical types', () => {
      const chemicals: ChemicalInput[] = [
        {
          name: 'EDTA',
          type: 'chelator',
          quantity: 100,
          unit: 'g',
          formulaType: 'SL'
        },
        {
          name: 'ยากำจัดแมลง WP',
          type: 'suspended',
          quantity: 200,
          unit: 'g',
          formulaType: 'WP'
        },
        {
          name: 'ปุ๋ย NPK',
          type: 'fertilizer',
          quantity: 500,
          unit: 'g',
          formulaType: 'NPK'
        }
      ]

      const result = calculateMixingOrder(chemicals)

      expect(result.steps[1].chemicals).toHaveLength(1) // chelator
      expect(result.steps[2].chemicals).toHaveLength(1) // suspended
      expect(result.steps[4].chemicals).toHaveLength(1) // fertilizer
    })
  })

  describe('sorting suspended chemicals', () => {
    it('should sort suspended chemicals by quantity (น้อย -> มาก)', () => {
      const chemicals: ChemicalInput[] = [
        {
          name: 'ยา WP ขนาดใหญ่',
          type: 'suspended',
          quantity: 500,
          unit: 'g',
          formulaType: 'WP'
        },
        {
          name: 'ยา WP ขนาดเล็ก',
          type: 'suspended',
          quantity: 100,
          unit: 'g',
          formulaType: 'WP'
        },
        {
          name: 'ยา WP ขนาดกลาง',
          type: 'suspended',
          quantity: 300,
          unit: 'g',
          formulaType: 'WP'
        }
      ]

      const result = calculateMixingOrder(chemicals)
      const suspendedChemicals = result.steps[2].chemicals

      expect(suspendedChemicals).toHaveLength(3)
      expect(suspendedChemicals[0].quantity).toBe(100)
      expect(suspendedChemicals[1].quantity).toBe(300)
      expect(suspendedChemicals[2].quantity).toBe(500)
    })
  })

  describe('warning generation', () => {
    it('should generate warning for suspended chemicals', () => {
      const chemicals: ChemicalInput[] = [
        {
          name: 'ยากำจัดแมลง WP',
          type: 'suspended',
          quantity: 200,
          unit: 'g',
          formulaType: 'WP'
        }
      ]

      const result = calculateMixingOrder(chemicals)

      expect(result.warnings).toContain('ละลายยาที่เป็นผงในน้ำเล็กน้อยก่อนนำไปผสม')
    })

    it('should generate warning for fertilizer', () => {
      const chemicals: ChemicalInput[] = [
        {
          name: 'ปุ๋ย NPK',
          type: 'fertilizer',
          quantity: 500,
          unit: 'g',
          formulaType: 'NPK'
        }
      ]

      const result = calculateMixingOrder(chemicals)

      expect(result.warnings).toContain('ละลายปุ๋ยให้หมดก่อนนำไปผสมกับสารอื่น')
    })

    it('should generate multiple warnings', () => {
      const chemicals: ChemicalInput[] = [
        {
          name: 'ยากำจัดแมลง WP',
          type: 'suspended',
          quantity: 200,
          unit: 'g',
          formulaType: 'WP'
        },
        {
          name: 'ปุ๋ย NPK',
          type: 'fertilizer',
          quantity: 500,
          unit: 'g',
          formulaType: 'NPK'
        }
      ]

      const result = calculateMixingOrder(chemicals)

      expect(result.warnings).toHaveLength(2)
      expect(result.warnings).toContain('ละลายยาที่เป็นผงในน้ำเล็กน้อยก่อนนำไปผสม')
      expect(result.warnings).toContain('ละลายปุ๋ยให้หมดก่อนนำไปผสมกับสารอื่น')
    })
  })

  describe('edge cases', () => {
    it('should handle empty chemical list', () => {
      const chemicals: ChemicalInput[] = []

      const result = calculateMixingOrder(chemicals)

      expect(result.steps).toHaveLength(8)
      expect(result.steps.every(step => step.chemicals.length === 0)).toBe(true)
      expect(result.warnings).toHaveLength(0)
    })

    it('should handle single chemical', () => {
      const chemicals: ChemicalInput[] = [
        {
          name: 'ยาเดียว',
          type: 'liquid',
          quantity: 100,
          unit: 'ml',
          formulaType: 'SL'
        }
      ]

      const result = calculateMixingOrder(chemicals)

      expect(result.steps[3].chemicals).toHaveLength(1)
      expect(result.steps[3].chemicals[0].name).toBe('ยาเดียว')
    })

    it('should handle all chemical types', () => {
      const chemicals: ChemicalInput[] = [
        { name: 'Chelator', type: 'chelator', quantity: 100, unit: 'g' },
        { name: 'Suspended', type: 'suspended', quantity: 200, unit: 'g' },
        { name: 'Liquid', type: 'liquid', quantity: 100, unit: 'ml' },
        { name: 'Fertilizer', type: 'fertilizer', quantity: 500, unit: 'g' },
        { name: 'Adjuvant', type: 'adjuvant', quantity: 50, unit: 'ml' },
        { name: 'Oil Concentrate', type: 'oil_concentrate', quantity: 100, unit: 'ml' },
        { name: 'Oil', type: 'oil', quantity: 200, unit: 'ml' }
      ]

      const result = calculateMixingOrder(chemicals)

      // Verify all steps have chemicals
      expect(result.steps[1].chemicals).toHaveLength(1) // chelator
      expect(result.steps[2].chemicals).toHaveLength(1) // suspended
      expect(result.steps[3].chemicals).toHaveLength(1) // liquid
      expect(result.steps[4].chemicals).toHaveLength(1) // fertilizer
      expect(result.steps[5].chemicals).toHaveLength(1) // adjuvant
      expect(result.steps[6].chemicals).toHaveLength(1) // oil_concentrate
      expect(result.steps[7].chemicals).toHaveLength(1) // oil
    })

    it('should handle multiple chemicals of same type', () => {
      const chemicals: ChemicalInput[] = [
        { name: 'ยา WP 1', type: 'suspended', quantity: 100, unit: 'g' },
        { name: 'ยา WP 2', type: 'suspended', quantity: 200, unit: 'g' },
        { name: 'ปุ๋ย NPK 1', type: 'fertilizer', quantity: 300, unit: 'g' },
        { name: 'ปุ๋ย NPK 2', type: 'fertilizer', quantity: 400, unit: 'g' }
      ]

      const result = calculateMixingOrder(chemicals)

      expect(result.steps[2].chemicals).toHaveLength(2) // suspended
      expect(result.steps[4].chemicals).toHaveLength(2) // fertilizer
    })

    it('should preserve chemical properties in output', () => {
      const chemicals: ChemicalInput[] = [
        {
          name: 'ยาทดสอบ',
          type: 'liquid',
          quantity: 150,
          unit: 'ml',
          formulaType: 'SC'
        }
      ]

      const result = calculateMixingOrder(chemicals)
      const outputChemical = result.steps[3].chemicals[0]

      expect(outputChemical.name).toBe('ยาทดสอบ')
      expect(outputChemical.type).toBe('liquid')
      expect(outputChemical.quantity).toBe(150)
      expect(outputChemical.unit).toBe('ml')
      expect(outputChemical.formulaType).toBe('SC')
    })
  })
})