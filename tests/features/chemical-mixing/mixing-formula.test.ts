import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMixingFormula, getMixingFormulasByOrchard, updateMixingFormulaUsage, deleteMixingFormula } from '@/app/actions/mixing-formulas'

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    mixingFormula: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
  }
}))

describe('Mixing Formula Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createMixingFormula', () => {
    it('should create a new mixing formula successfully', async () => {
      const formulaData = {
        orchardId: 'orchard-123',
        name: 'สูตรพื้นฐาน',
        description: 'สูตรสำหรับการป้องกันโรคพืชฐาน',
        components: [
          {
            name: 'ยากำจัดแมลง WP',
            type: 'suspended',
            quantity: 200,
            unit: 'g',
            formulaType: 'WP',
            step: 2
          }
        ]
      }

      const mockCreatedFormula = {
        id: 'formula-123',
        ...formulaData,
        createdAt: new Date(),
        usedCount: 0
      }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.mixingFormula.create).mockResolvedValue(mockCreatedFormula)

      const result = await createMixingFormula(formulaData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockCreatedFormula)
      expect(prisma.mixingFormula.create).toHaveBeenCalledWith({
        data: {
          orchardId: formulaData.orchardId,
          name: formulaData.name,
          description: formulaData.description,
          components: formulaData.components,
          usedCount: 0
        }
      })
    })

    it('should handle validation errors', async () => {
      const invalidFormulaData = {
        orchardId: '',
        name: '',
        description: '',
        components: []
      }

      const result = await createMixingFormula(invalidFormulaData)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle database errors', async () => {
      const formulaData = {
        orchardId: 'orchard-123',
        name: 'สูตรทดสอบ',
        description: 'สูตรสำหรับทดสอบ database error',
        components: []
      }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.mixingFormula.create).mockRejectedValue(new Error('Database connection failed'))

      const result = await createMixingFormula(formulaData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Database connection failed')
    })

    it('should handle missing orchardId', async () => {
      const formulaData = {
        orchardId: '',
        name: 'สูตรทดสอบ',
        description: 'สูตรที่ไม่มี orchardId',
        components: []
      }

      const result = await createMixingFormula(formulaData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('orchardId is required')
    })
  })

  describe('getMixingFormulasByOrchard', () => {
    it('should retrieve all formulas for an orchard', async () => {
      const orchardId = 'orchard-123'
      const mockFormulas = [
        {
          id: 'formula-1',
          name: 'สูตรที่ 1',
          description: 'คำอธิบายสูตรที่ 1',
          components: [],
          createdAt: new Date(),
          usedCount: 5
        },
        {
          id: 'formula-2',
          name: 'สูตรที่ 2',
          description: 'คำอธิบายสูตรที่ 2',
          components: [],
          createdAt: new Date(),
          usedCount: 3
        }
      ]

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.mixingFormula.findMany).mockResolvedValue(mockFormulas)

      const result = await getMixingFormulasByOrchard(orchardId)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0].name).toBe('สูตรที่ 1')
      expect(prisma.mixingFormula.findMany).toHaveBeenCalledWith({
        where: { orchardId },
        orderBy: { createdAt: 'desc' }
      })
    })

    it('should handle empty formula list', async () => {
      const orchardId = 'empty-orchard'

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.mixingFormula.findMany).mockResolvedValue([])

      const result = await getMixingFormulasByOrchard(orchardId)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(0)
    })
  })

  describe('updateMixingFormulaUsage', () => {
    it('should increment usage count successfully', async () => {
      const formulaId = 'formula-123'
      const mockUpdatedFormula = {
        id: formulaId,
        usedCount: 6
      }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.mixingFormula.update).mockResolvedValue(mockUpdatedFormula)

      const result = await updateMixingFormulaUsage(formulaId)

      expect(result.success).toBe(true)
      expect(prisma.mixingFormula.update).toHaveBeenCalledWith({
        where: { id: formulaId },
        data: { usedCount: { increment: 1 } }
      })
    })

    it('should handle formula not found', async () => {
      const formulaId = 'non-existent-formula'

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.mixingFormula.update).mockRejectedValue(new Error('Formula not found'))

      const result = await updateMixingFormulaUsage(formulaId)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Formula not found')
    })
  })

  describe('deleteMixingFormula', () => {
    it('should delete formula successfully', async () => {
      const formulaId = 'formula-123'
      const mockDeletedFormula = {
        id: formulaId,
        name: 'สูตรที่จะถูกลบ'
      }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.mixingFormula.delete).mockResolvedValue(mockDeletedFormula)

      const result = await deleteMixingFormula(formulaId)

      expect(result.success).toBe(true)
      expect(prisma.mixingFormula.delete).toHaveBeenCalledWith({
        where: { id: formulaId }
      })
    })

    it('should handle deletion of formula with dependencies', async () => {
      const formulaId = 'formula-with-dependencies'

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.mixingFormula.delete).mockRejectedValue(
        new Error('Cannot delete formula: has dependencies')
      )

      const result = await deleteMixingFormula(formulaId)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Cannot delete formula: has dependencies')
    })
  })
})