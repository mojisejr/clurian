// Types for chemical mixing - will be implemented in lib/mixing-calculator.ts
export type ChemicalType = 'chelator' | 'suspended' | 'liquid' | 'fertilizer' | 'adjuvant' | 'oil_concentrate' | 'oil'

export interface ChemicalInput {
  name: string
  type: ChemicalType
  quantity: number
  unit: string
  formulaType?: string
}

export interface MixingOrderStep {
  step: number
  description: string
  chemicals: ChemicalInput[]
}

export interface MixingOrderResult {
  steps: MixingOrderStep[]
  warnings: string[]
  totalSteps: number
  estimatedTime?: string
  waterAmount?: number
}

// Use these types in tests
export type ChemicalInputType = ChemicalInput
export type MixingOrderResultType = MixingOrderResult

export const mockChemicals: Record<string, ChemicalInput[]> = {
  empty: [],
  single: [
    {
      name: 'ยาเดี่ยว',
      type: 'liquid',
      quantity: 100,
      unit: 'ml',
      formulaType: 'SL'
    }
  ],
  basic: [
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
  ],
  complex: [
    { name: 'EDTA', type: 'chelator', quantity: 100, unit: 'g', formulaType: 'SL' },
    { name: 'ยา WP 1', type: 'suspended', quantity: 100, unit: 'g', formulaType: 'WP' },
    { name: 'ยา WP 2', type: 'suspended', quantity: 300, unit: 'g', formulaType: 'WP' },
    { name: 'ยา WP 3', type: 'suspended', quantity: 200, unit: 'g', formulaType: 'WP' },
    { name: 'ยา SL', type: 'liquid', quantity: 150, unit: 'ml', formulaType: 'SL' },
    { name: 'ปุ๋ย NPK 1', type: 'fertilizer', quantity: 200, unit: 'g', formulaType: 'NPK' },
    { name: 'ปุ๋ย NPK 2', type: 'fertilizer', quantity: 300, unit: 'g', formulaType: 'NPK' },
    { name: 'สารจับใบ', type: 'adjuvant', quantity: 50, unit: 'ml', formulaType: 'Adjuvant' },
    { name: 'ยา EC', type: 'oil_concentrate', quantity: 100, unit: 'ml', formulaType: 'EC' },
    { name: 'น้ำมัน', type: 'oil', quantity: 200, unit: 'ml', formulaType: 'Oil' }
  ],
  allSuspended: [
    { name: 'ยา WP ขนาดเล็ก', type: 'suspended', quantity: 50, unit: 'g', formulaType: 'WP' },
    { name: 'ยา WP ขนาดกลาง', type: 'suspended', quantity: 150, unit: 'g', formulaType: 'WP' },
    { name: 'ยา WP ขนาดใหญ่', type: 'suspended', quantity: 300, unit: 'g', formulaType: 'WP' },
    { name: 'ยา WG', type: 'suspended', quantity: 200, unit: 'g', formulaType: 'WG' }
  ]
}

export const mockFormulas = [
  {
    id: 'formula-1',
    orchardId: 'orchard-1',
    name: 'สูตรพื้นฐาน',
    description: 'สูตรสำหรับการป้องกันโรคพืชฐาน',
    components: mockChemicals.basic,
    createdAt: new Date('2024-01-01'),
    usedCount: 5
  },
  {
    id: 'formula-2',
    orchardId: 'orchard-1',
    name: 'สูตรพิเศษ',
    description: 'สูตรสำหรับโรครุนแรง',
    components: mockChemicals.complex,
    createdAt: new Date('2024-01-15'),
    usedCount: 3
  },
  {
    id: 'formula-3',
    orchardId: 'orchard-2',
    name: 'สูตรออร์แกนิค',
    description: 'สูตรสำหรับการเกษตรออร์แกนิค',
    components: [
      { name: 'น้ำหมักชีวภาพ', type: 'chelator', quantity: 200, unit: 'ml', formulaType: 'SL' },
      { name: 'สารสกัดพืช', type: 'liquid', quantity: 100, unit: 'ml', formulaType: 'SL' }
    ],
    createdAt: new Date('2024-02-01'),
    usedCount: 10
  }
]

export const expectedMixingOrder: Record<string, MixingOrderResult> = {
  empty: {
    steps: [
      { step: 0, description: 'เตรียมน้ำ', chemicals: [] },
      { step: 1, description: 'สารคีเลต/สารอินทรีย์', chemicals: [] },
      { step: 2, description: 'สารแขวนลอย', chemicals: [] },
      { step: 3, description: 'สารละลายน้ำใส', chemicals: [] },
      { step: 4, description: 'ปุ๋ยมีประจุ', chemicals: [] },
      { step: 5, description: 'สารจับใบ', chemicals: [] },
      { step: 6, description: 'สารละลายน้ำมัน', chemicals: [] },
      { step: 7, description: 'ออยล์', chemicals: [] }
    ],
    warnings: [],
    totalSteps: 8,
    estimatedTime: '5 นาที',
    waterAmount: 1000
  },
  basic: {
    steps: [
      { step: 0, description: 'เตรียมน้ำ', chemicals: [] },
      { step: 1, description: 'สารคีเลต/สารอินทรีย์', chemicals: [mockChemicals.basic[0]] },
      { step: 2, description: 'สารแขวนลอย', chemicals: [mockChemicals.basic[1]] },
      { step: 3, description: 'สารละลายน้ำใส', chemicals: [] },
      { step: 4, description: 'ปุ๋ยมีประจุ', chemicals: [mockChemicals.basic[2]] },
      { step: 5, description: 'สารจับใบ', chemicals: [] },
      { step: 6, description: 'สารละลายน้ำมัน', chemicals: [] },
      { step: 7, description: 'ออยล์', chemicals: [] }
    ],
    warnings: [
      'ละลายยาที่เป็นผงในน้ำเล็กน้อยก่อนนำไปผสม',
      'ละลายปุ๋ยให้หมดก่อนนำไปผสมกับสารอื่น'
    ],
    totalSteps: 8,
    estimatedTime: '5 นาที',
    waterAmount: 8000
  },
  allSuspended: {
    steps: [
      { step: 0, description: 'เตรียมน้ำ', chemicals: [] },
      { step: 1, description: 'สารคีเลต/สารอินทรีย์', chemicals: [] },
      { step: 2, description: 'สารแขวนลอย', chemicals: [
        mockChemicals.allSuspended[0], // 50g
        mockChemicals.allSuspended[2], // 300g
        mockChemicals.allSuspended[3], // 200g
        mockChemicals.allSuspended[1]  // 150g
      ]},
      { step: 3, description: 'สารละลายน้ำใส', chemicals: [] },
      { step: 4, description: 'ปุ๋ยมีประจุ', chemicals: [] },
      { step: 5, description: 'สารจับใบ', chemicals: [] },
      { step: 6, description: 'สารละลายน้ำมัน', chemicals: [] },
      { step: 7, description: 'ออยล์', chemicals: [] }
    ],
    warnings: [
      'ละลายยาที่เป็นผงในน้ำเล็กน้อยก่อนนำไปผสม'
    ],
    totalSteps: 8,
    estimatedTime: '5 นาที',
    waterAmount: 14000
  }
}

// Helper functions for testing - to be used in test files with vitest expect
export const createMockMixingFormula = (overrides: Record<string, unknown> = {}) => {
  return {
    ...mockFormulas[0],
    ...overrides,
    components: overrides.components || mockFormulas[0].components
  }
}

export const createMockChemical = (overrides: Partial<ChemicalInput> = {}): ChemicalInput => {
  return {
    name: 'ยาทดสอบ',
    type: 'liquid',
    quantity: 100,
    unit: 'ml',
    formulaType: 'SL',
    ...overrides
  }
}

// Mock user session
export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User'
}

// Mock orchard
export const mockOrchard = {
  id: 'orchard-1',
  name: 'สวนทดสอบ',
  ownerId: 'user-1',
  zones: ['A', 'B', 'C'],
  createdAt: new Date('2024-01-01')
}