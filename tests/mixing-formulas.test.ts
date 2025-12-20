import { describe, it, expect, beforeEach, vi } from 'vitest'
import { auth } from '@/lib/auth'
import {
  getMixingFormulasByOrchard,
  createMixingFormula,
  updateMixingFormulaUsage,
  deleteMixingFormula,
  validateChemicalType
} from '@/app/actions/mixing-formulas'

// Mock prisma
const mockPrisma = {
  orchard: {
    findFirst: vi.fn()
  },
  mixingFormula: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findFirst: vi.fn()
  },
  activityLog: {
    count: vi.fn()
  }
}

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma
}))

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(() =>
        Promise.resolve({
          user: {
            id: 'user-1',
            name: 'Test User'
          }
        })
      )
    }
  }
}))

// Mock headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers()))
}))

describe('Mixing Formulas Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMixingFormulasByOrchard', () => {
    it('ควรดึงสูตรยาตาม orchardId ได้', async () => {
      const orchardId = 'orchard-1'
      const mockFormulas = [
        {
          id: 'formula-1',
          name: 'สูตรทดสอบ 1',
          description: 'คำอธิบาย',
          components: [],
          usedCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      mockPrisma.orchard.findFirst.mockResolvedValue({
        id: orchardId,
        name: 'สวนทดสอบ'
      })

      mockPrisma.mixingFormula.findMany.mockResolvedValue(mockFormulas)

      const result = await getMixingFormulasByOrchard(orchardId)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockFormulas)
      expect(mockPrisma.orchard.findFirst).toHaveBeenCalledWith({
        where: {
          id: orchardId,
          ownerId: 'user-1'
        }
      })
      expect(mockPrisma.mixingFormula.findMany).toHaveBeenCalledWith({
        where: { orchardId },
        orderBy: { createdAt: 'desc' }
      })
    })

    it('ควรคืน array ว่างถ้าไม่มีสูตรยา', async () => {
      const orchardId = 'orchard-1'

      mockPrisma.orchard.findFirst.mockResolvedValue({
        id: orchardId,
        name: 'สวนทดสอบ'
      })

      mockPrisma.mixingFormula.findMany.mockResolvedValue([])

      const result = await getMixingFormulasByOrchard(orchardId)

      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
    })

    it('ควร return error ถ้าไม่ได้รับอนุญาต', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null)

      const result = await getMixingFormulasByOrchard('orchard-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('ไม่ได้รับอนุญาตให้เข้าใช้งาน')
    })

    it('ควร return error ถ้าไม่พบ orchard', async () => {
      mockPrisma.orchard.findFirst.mockResolvedValue(null)

      const result = await getMixingFormulasByOrchard('orchard-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('ไม่พบสวนที่ระบุ')
    })

    it('ควร return error ถ้า orchardId ไม่ถูกต้อง', async () => {
      const result = await getMixingFormulasByOrchard('invalid-uuid')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('validateChemicalType', () => {
    it('ควร validate ประเภทสารเคมีที่ถูกต้อง', async () => {
      const validTypes = [
        'WP', 'WDG', 'GR', 'DF', 'EC', 'SC', 'SL', 'FERT', 'SURF'
      ]

      for (const type of validTypes) {
        const result = await validateChemicalType(type)
        expect(result.success).toBe(true)
        expect(result.data).toBe(type)
      }
    })

    it('ควร reject ประเภทสารเคมีที่ไม่ถูกต้อง', async () => {
      const result = await validateChemicalType('INVALID_TYPE')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid chemical type')
    })

    it('ควรรองรับประเภทเก่าสำหรับ backward compatibility', async () => {
      const oldTypes = [
        'chelator', 'suspended', 'liquid', 'fertilizer', 'adjuvant'
      ]

      for (const type of oldTypes) {
        const result = await validateChemicalType(type)
        expect(result.success).toBe(true)
        expect(result.data).toBe(type)
      }
    })
  })

  describe('updateMixingFormulaUsage', () => {
    it('ควรอัพเดทจำนวนการใช้สูตรได้', async () => {
      const formulaId = 'formula-1'
      const mockFormula = {
        id: formulaId,
        name: 'สูตรทดสอบ',
        usedCount: 5
      }

      mockPrisma.mixingFormula.findFirst.mockResolvedValue({
        id: formulaId,
        orchard: { ownerId: 'user-1' }
      })

      mockPrisma.mixingFormula.update.mockResolvedValue({
        ...mockFormula,
        usedCount: 6
      })

      const result = await updateMixingFormulaUsage(formulaId)

      expect(result.success).toBe(true)
      expect(result.data?.usedCount).toBe(6)
      expect(mockPrisma.mixingFormula.update).toHaveBeenCalledWith({
        where: { id: formulaId },
        data: { usedCount: { increment: 1 } }
      })
    })

    it('ควร return error ถ้าไม่พบสูตร', async () => {
      mockPrisma.mixingFormula.findFirst.mockResolvedValue(null)

      const result = await updateMixingFormulaUsage('formula-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('ไม่พบสูตรที่ระบุ')
    })
  })

  describe('deleteMixingFormula', () => {
    it('ควรลบสูตรที่ไม่มีการใช้งานได้', async () => {
      const formulaId = 'formula-1'

      mockPrisma.mixingFormula.findFirst.mockResolvedValue({
        id: formulaId,
        orchard: { ownerId: 'user-1' },
        _count: { activities: 0 }
      })

      mockPrisma.activityLog.count.mockResolvedValue(0)
      mockPrisma.mixingFormula.delete.mockResolvedValue({ id: formulaId })

      const result = await deleteMixingFormula(formulaId)

      expect(result.success).toBe(true)
      expect(result.message).toBe('ลบสูตรสำเร็จ')
      expect(mockPrisma.mixingFormula.delete).toHaveBeenCalledWith({
        where: { id: formulaId }
      })
    })

    it('ไม่ควรลบสูตรที่มีการใช้งานแล้ว', async () => {
      const formulaId = 'formula-1'

      mockPrisma.mixingFormula.findFirst.mockResolvedValue({
        id: formulaId,
        orchard: { ownerId: 'user-1' }
      })

      mockPrisma.activityLog.count.mockResolvedValue(3)

      const result = await deleteMixingFormula(formulaId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('มีกิจกรรมที่ใช้สูตรนี้แล้ว 3 รายการ ไม่สามารถลบได้')
    })
  })
})