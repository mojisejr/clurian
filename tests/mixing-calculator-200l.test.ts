import { describe, it, expect } from 'vitest'
import type { ChemicalInput } from '@/lib/mixing-calculator'

// Import the function we're about to create
// This will fail initially since the function doesn't exist yet
import { calculateMixingOrderFor200L } from '@/lib/mixing-calculator'

// Mock data for testing
const mockChemicals: Record<string, ChemicalInput[]> = {
  empty: [],
  single: [
    {
      name: 'ยาเดี่ยว',
      type: 'SL',
      quantity: 100,
      unit: 'ml'
    }
  ],
  threeSteps: [
    // Step 1: Chelator
    {
      name: 'EDTA',
      type: 'SC',  // Step 1
      quantity: 100,
      unit: 'g'
    },
    // Step 3: Liquid
    {
      name: 'ยาคุมหญ้า',
      type: 'SL',  // Step 3
      quantity: 200,
      unit: 'ml'
    },
    // Step 7: Oil
    {
      name: 'น้ำมันชะเอม',
      type: 'ME',  // Step 7
      quantity: 50,
      unit: 'ml'
    }
  ],
  allSteps: [
    { name: 'EDTA', type: 'SC', quantity: 100, unit: 'g' },           // Step 1
    { name: 'ยา WP', type: 'WP', quantity: 200, unit: 'g' },           // Step 2
    { name: 'ยาน้ำ', type: 'SL', quantity: 150, unit: 'ml' },          // Step 3
    { name: 'ปุ๋ย NPK', type: 'FERT', quantity: 500, unit: 'g' },       // Step 4
    { name: 'สารจับใบ', type: 'SURF', quantity: 50, unit: 'ml' },     // Step 5
    { name: 'ยา EC', type: 'EC', quantity: 100, unit: 'ml' },          // Step 6
    { name: 'น้ำมัน', type: 'ME', quantity: 200, unit: 'ml' }           // Step 7
  ],
  multipleInSameStep: [
    { name: 'ยา WP 1', type: 'WP', quantity: 100, unit: 'g' },          // Step 2
    { name: 'ยา WP 2', type: 'WP', quantity: 200, unit: 'g' },          // Step 2
    { name: 'ยา WP 3', type: 'WP', quantity: 150, unit: 'g' }           // Step 2
  ]
}

describe('calculateMixingOrderFor200L', () => {
  describe('สูตรที่มีสารเคมีในทุกขั้น', () => {
    it('ควรคืนค่า 7 ขั้นตอนเมื่อมีสารเคมีครบทุกขั้น', () => {
      const result = calculateMixingOrderFor200L(mockChemicals.allSteps)
      expect(result.totalSteps).toBe(7)
      expect(result.waterVolume).toBe(200)
      expect(result.steps).toHaveLength(7)
    })

    it('ควรมีปริมาณน้ำคงที่ 200 ลิตร', () => {
      const result = calculateMixingOrderFor200L(mockChemicals.allSteps)
      expect(result.waterVolume).toBe(200)
    })
  })

  describe('สูตรที่มีสารเคมีบางขั้น', () => {
    it('ควร filter ขั้นว่างออกเมื่อมีสารเคมี 3 ขั้น (1, 3, 7)', () => {
      const result = calculateMixingOrderFor200L(mockChemicals.threeSteps)
      expect(result.totalSteps).toBe(3)
      expect(result.steps).toHaveLength(3)

      // Check original steps are preserved
      expect(result.steps[0].originalStep).toBe(1)  // Chelator
      expect(result.steps[0].chemicals[0].type).toBe('SC')

      expect(result.steps[1].originalStep).toBe(3)  // Liquid
      expect(result.steps[1].chemicals[0].type).toBe('SL')

      expect(result.steps[2].originalStep).toBe(7)  // Oil
      expect(result.steps[2].chemicals[0].type).toBe('ME')
    })

    it('ควร reindex ขั้นเป็น 1, 2, 3 เมื่อมีสารเคมี 3 ขั้น', () => {
      const result = calculateMixingOrderFor200L(mockChemicals.threeSteps)

      // Display steps should be sequential
      expect(result.steps[0].displayStep).toBe(1)
      expect(result.steps[1].displayStep).toBe(2)
      expect(result.steps[2].displayStep).toBe(3)
    })

    it('ควรคืนค่า 1 ขั้นเมื่อมีสารเคมีเพียงขั้นเดียว', () => {
      const result = calculateMixingOrderFor200L(mockChemicals.single)
      expect(result.totalSteps).toBe(1)
      expect(result.steps).toHaveLength(1)
      expect(result.waterVolume).toBe(200)
    })
  })

  describe('Edge Cases', () => {
    it('ควรคืนค่า 0 ขั้นเมื่อไม่มีสารเคมี', () => {
      const result = calculateMixingOrderFor200L(mockChemicals.empty)
      expect(result.totalSteps).toBe(0)
      expect(result.steps).toHaveLength(0)
      expect(result.warnings).toHaveLength(0)
    })

    it('ควรคืนค่า 1 ขั้นเมื่อมีสารเคมีหลายตัวในขั้นเดียวกัน', () => {
      const result = calculateMixingOrderFor200L(mockChemicals.multipleInSameStep)
      expect(result.totalSteps).toBe(1)
      expect(result.steps[0].chemicals).toHaveLength(3)
      expect(result.steps[0].displayStep).toBe(1)
    })
  })

  describe('Warnings', () => {
    it('ควรแสดง warning เมื่อมีสารเคมีที่เป็นผง', () => {
      const result = calculateMixingOrderFor200L(mockChemicals.allSteps)
      expect(result.warnings).toContain('ละลายยาที่เป็นผงในน้ำเล็กน้อยก่อนนำไปผสม')
    })

    it('ควรแสดง warning เมื่อมีปุ๋ย', () => {
      const result = calculateMixingOrderFor200L(mockChemicals.allSteps)
      expect(result.warnings).toContain('ละลายปุ๋ยให้หมดก่อนนำไปผสมกับสารอื่น')
    })
  })

  describe('Step Descriptions', () => {
    it('ควรคงค่า description ของขั้นเดิมไว้', () => {
      const result = calculateMixingOrderFor200L(mockChemicals.threeSteps)

      // Check descriptions match original steps
      expect(result.steps[0].description).toBe('สารคีเลต/สารอินทรีย์')  // From step 1
      expect(result.steps[1].description).toBe('สารละลายน้ำใส')         // From step 3
      expect(result.steps[2].description).toBe('ออยล์')                   // From step 7
    })
  })
})