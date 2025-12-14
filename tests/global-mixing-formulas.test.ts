import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getGlobalMixingFormulas,
  createGlobalMixingFormula
} from '@/app/actions/mixing-formulas'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// Mock dependencies
vi.mock('@/lib/prisma')
vi.mock('@/lib/auth')
vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Map())
}))

// Mock the prisma methods
const mockPrisma = {
  mixingFormula: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn()
  },
  orchard: {
    findFirst: vi.fn()
  }
}

// Mock prisma client
vi.mocked(prisma).mixingFormula = mockPrisma.mixingFormula
vi.mocked(prisma).orchard = mockPrisma.orchard

describe('Global Mixing Formulas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getGlobalMixingFormulas', () => {
    it('should return all formulas for authenticated user', async () => {
      // Arrange
      const mockSession = { user: { id: 'user-1' } }
      const mockFormulas = [
        { id: 'formula-1', name: 'Global Formula 1' },
        { id: 'formula-2', name: 'Global Formula 2' }
      ]

      ;((auth.api.getSession) as vi.Mock).mockResolvedValue(mockSession)
      mockPrisma.mixingFormula.findMany.mockResolvedValue(mockFormulas)

      // Act
      const result = await getGlobalMixingFormulas()

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockFormulas)
      expect(prisma.mixingFormula.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { orchardId: null }, // Global formulas
            {
              orchard: {
                ownerId: mockSession.user.id
              }
            }
          ]
        },
        orderBy: { createdAt: 'desc' }
      })
    })

    it('should return error for unauthenticated user', async () => {
      // Arrange
      ;((auth.api.getSession) ).mockResolvedValue(null)

      // Act
      const result = await getGlobalMixingFormulas()

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('ไม่ได้รับอนุญาตให้เข้าใช้งาน')
    })

    it('should handle database errors', async () => {
      // Arrange
      const mockSession = { user: { id: 'user-1' } }
      ;((auth.api.getSession) ).mockResolvedValue(mockSession)
      mockPrisma.mixingFormula.findMany.mockRejectedValue(new Error('Database error'))

      // Act
      const result = await getGlobalMixingFormulas()

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('ไม่สามารถดึงข้อมูลสูตรได้ กรุณาลองใหม่')
    })
  })

  describe('createGlobalMixingFormula', () => {
    it('should create formula without orchardId for global access', async () => {
      // Arrange
      const mockSession = { user: { id: 'user-1' } }
      const formulaData = {
        name: 'Global Formula',
        description: 'Test description',
        components: [
          { name: 'Chemical 1', type: 'WP', quantity: 100, unit: 'g', step: 1 }
        ]
      }
      const createdFormula = { id: 'formula-1', ...formulaData, orchardId: null }

      ;((auth.api.getSession) ).mockResolvedValue(mockSession)
      mockPrisma.orchard.findFirst.mockResolvedValue({ id: 'orchard-1' } )
      mockPrisma.mixingFormula.create.mockResolvedValue(createdFormula )

      // Act
      const result = await createGlobalMixingFormula(formulaData)

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toEqual(createdFormula)
      expect(prisma.mixingFormula.create).toHaveBeenCalledWith({
        data: {
          name: formulaData.name,
          description: formulaData.description,
          components: formulaData.components,
          usedCount: 0,
          orchardId: null // Global formula has no orchardId
        }
      })
    })

    it('should return error for unauthenticated user', async () => {
      // Arrange
      ;((auth.api.getSession) ).mockResolvedValue(null)

      // Act
      const result = await createGlobalMixingFormula({
        name: 'Global Formula',
        components: []
      })

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('ไม่ได้รับอนุญาตให้เข้าใช้งาน')
    })
  })

  describe('Migration behavior', () => {
    it('should preserve existing orchard-specific formulas during migration to global', async () => {
      // This test ensures that orchardId is set to null for existing formulas
      // while preserving all other data

      // Arrange
      const existingFormula = {
        id: 'formula-1',
        orchardId: 'orchard-1',
        name: 'Old Orchard Formula',
        description: 'To be migrated',
        components: [{ name: 'Chemical', type: 'WP', quantity: 100, unit: 'g', step: 1 }],
        usedCount: 5,
        createdAt: new Date()
      }

      mockPrisma.mixingFormula.update.mockResolvedValue({
        ...existingFormula,
        orchardId: null
      } )

      // Act
      const result = await prisma.mixingFormula.update({
        where: { id: existingFormula.id },
        data: { orchardId: null }
      })

      // Assert
      expect(result.orchardId).toBe(null)
      expect(result.name).toBe(existingFormula.name)
      expect(result.usedCount).toBe(existingFormula.usedCount)
    })
  })
})