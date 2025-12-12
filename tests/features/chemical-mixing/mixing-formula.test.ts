import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMixingFormula, getMixingFormulasByOrchard, updateMixingFormulaUsage, deleteMixingFormula } from '@/app/actions/mixing-formulas'

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn()
    }
  }
}))

// Mock headers function
vi.mock('next/headers', () => ({
  headers: vi.fn()
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mixingFormula: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn()
    },
    orchard: {
      findFirst: vi.fn()
    }
  }
}))

describe('Mixing Formula Actions', () => {
  beforeEach(async () => {
    vi.clearAllMocks()

    // Mock headers
    const { headers } = await import('next/headers')
    vi.mocked(headers).mockResolvedValue(new Map())

    // Mock auth session
    const mockAuth = vi.mocked(await import('@/lib/auth'))
    mockAuth.auth.api.getSession.mockResolvedValue({
      user: { id: 'user-1' }
    })

    // Mock orchard lookup
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.orchard.findFirst).mockResolvedValue({
      id: 'orchard-123',
      ownerId: 'user-1'
    } as { id: string; ownerId: string })
  })

  describe('createMixingFormula', () => {
    it('should create a new mixing formula successfully', async () => {
      const formulaData = {
        orchardId: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
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
        orchardId: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
        name: '', // Empty name should fail validation
        description: '',
        components: [] // Empty components should fail validation
      }

      const result = await createMixingFormula(invalidFormulaData)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle database errors', async () => {
      const formulaData = {
        orchardId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'สูตรทดสอบ',
        description: 'สูตรสำหรับทดสอบ database error',
        components: [
          {
            name: 'ยาทดสอบ',
            type: 'liquid',
            quantity: 100,
            unit: 'ml',
            step: 1
          }
        ]
      }

      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.mixingFormula.create).mockRejectedValue(new Error('Database connection failed'))

      const result = await createMixingFormula(formulaData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('ไม่สามารถสร้างสูตรได้ กรุณาลองใหม่')
    })

    it('should handle missing orchardId', async () => {
      const formulaData = {
        orchardId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'สูตรทดสอบ',
        description: 'สูตรที่ไม่มี orchardId',
        components: []
      }

      // Mock orchard findFirst to return null (orchard not found)
      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.orchard.findFirst).mockResolvedValue(null)

      const result = await createMixingFormula(formulaData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('ไม่พบสวนที่ระบุ')
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
      // Mock findFirst for ownership check
      vi.mocked(prisma.mixingFormula.findFirst).mockResolvedValue({
        id: formulaId,
        orchard: { ownerId: 'user-1' }
      })

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
      // Mock orchard findFirst to return null (formula not found)
      vi.mocked(prisma.mixingFormula.findFirst).mockResolvedValue(null)

      const result = await updateMixingFormulaUsage(formulaId)

      expect(result.success).toBe(false)
      expect(result.error).toContain('ไม่พบสูตรที่ระบุ')
    })
  })

  describe('deleteMixingFormula', () => {
    it('should delete formula successfully', async () => {
      const formulaId = 'formula-123'

      // Mock findFirst for ownership check
      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.mixingFormula.findFirst).mockResolvedValue({
        id: formulaId,
        orchard: { ownerId: 'user-1' }
      } as { id: string; orchard: { ownerId: string } })

      const result = await deleteMixingFormula(formulaId)

      expect(result.success).toBe(true)
      expect(prisma.mixingFormula.delete).toHaveBeenCalledWith({
        where: { id: formulaId }
      })
    })

    it('should handle deletion of formula with dependencies', async () => {
      const formulaId = 'formula-with-dependencies'

      // Mock findFirst for ownership check
      const { prisma } = await import('@/lib/prisma')
      vi.mocked(prisma.mixingFormula.findFirst).mockResolvedValue({
        id: formulaId,
        orchard: { ownerId: 'user-1' }
      } as { id: string; orchard: { ownerId: string } })

      // Mock delete to reject
      vi.mocked(prisma.mixingFormula.delete).mockRejectedValue(
        new Error('Cannot delete formula: has dependencies')
      )

      const result = await deleteMixingFormula(formulaId)

      expect(result.success).toBe(false)
      expect(result.error).toContain('ไม่สามารถลบสูตรได้')
    })
  })
})