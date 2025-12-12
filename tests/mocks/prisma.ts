import { vi } from 'vitest'
import { mockChemicals, mockFormulas } from '../helpers/chemical-mixing'

// Mock Prisma Client
export const mockPrismaClient = {
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  $transaction: vi.fn(),

  // Mock models
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },

  orchard: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },

  tree: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn()
  },

  activityLog: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn()
  },

  // Chemical mixing related mocks
  mixingFormula: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },

  chemicalMixingGuide: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}

// Helper to reset all mocks
export const resetPrismaMocks = () => {
  Object.values(mockPrismaClient).forEach(model => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach(method => {
        if (typeof method === 'function' && method.mockReset) {
          method.mockReset()
        }
      })
    }
  })
}

// Helper to setup common mock return values
export const setupMockMixingFormula = () => {

  mockPrismaClient.mixingFormula.create.mockImplementation(async ({ data }) => ({
    id: `formula-${Date.now()}`,
    ...data,
    createdAt: new Date(),
    usedCount: data.usedCount || 0
  }))

  mockPrismaClient.mixingFormula.findMany.mockImplementation(async ({ where }: { where?: Record<string, unknown> }) => {
    if (where?.orchardId === 'orchard-1') {
      return mockFormulas.filter((f: { orchardId: string }) => f.orchardId === 'orchard-1')
    }
    if (where?.orchardId === 'orchard-2') {
      return mockFormulas.filter((f: { orchardId: string }) => f.orchardId === 'orchard-2')
    }
    return []
  })

  mockPrismaClient.mixingFormula.update.mockImplementation(async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => ({
    id: where.id,
    name: 'Updated Formula',
    description: 'Updated Description',
    components: mockChemicals.basic,
    orchardId: 'orchard-1',
    createdAt: new Date(),
    usedCount: data.usedCount || 5,
    ...data
  }))

  mockPrismaClient.mixingFormula.delete.mockImplementation(async ({ where }) => ({
    id: where.id,
    name: 'Deleted Formula',
    description: 'This formula was deleted',
    components: [],
    orchardId: 'orchard-1',
    createdAt: new Date(),
    usedCount: 0
  }))
}

export const setupMockUser = () => {
  mockPrismaClient.user.findUnique.mockImplementation(async ({ where }) => {
    if (where?.id === 'user-1') {
      return {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date()
      }
    }
    return null
  })
}

export const setupMockOrchard = () => {
  mockPrismaClient.orchard.findUnique.mockImplementation(async ({ where }) => {
    if (where?.id === 'orchard-1') {
      return {
        id: 'orchard-1',
        name: 'สวนทดสอบ',
        ownerId: 'user-1',
        zones: ['A', 'B', 'C'],
        createdAt: new Date()
      }
    }
    return null
  })

  mockPrismaClient.orchard.findMany.mockImplementation(async ({ where }) => {
    if (where?.ownerId === 'user-1') {
      return [{
        id: 'orchard-1',
        name: 'สวนทดสอบ',
        ownerId: 'user-1',
        zones: ['A', 'B', 'C'],
        createdAt: new Date()
      }]
    }
    return []
  })
}

export const setupMockActivityLog = () => {
  mockPrismaClient.activityLog.create.mockImplementation(async ({ data }) => ({
    id: `activity-${Date.now()}`,
    ...data,
    createdAt: new Date(),
    status: 'COMPLETED'
  }))

  mockPrismaClient.activityLog.findMany.mockImplementation(async ({ where }) => {
    if (where?.orchardId === 'orchard-1') {
      return [
        {
          id: 'activity-1',
          orchardId: 'orchard-1',
          logType: 'INDIVIDUAL',
          treeId: 'tree-1',
          action: 'ให้น้ำ',
          note: 'ให้น้ำต้นที่ 1',
          performDate: new Date('2024-01-01'),
          status: 'COMPLETED',
          followUpDate: null,
          createdAt: new Date()
        }
      ]
    }
    return []
  })
}

// Complete setup for all common mocks
export const setupAllMocks = () => {
  setupMockMixingFormula()
  setupMockUser()
  setupMockOrchard()
  setupMockActivityLog()
}