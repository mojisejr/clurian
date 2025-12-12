'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

const CreateMixingFormulaSchema = z.object({
  orchardId: z.string().uuid(),
  name: z.string().min(1, 'ชื่อสูตรต้องไม่ว่างเปล่า'),
  description: z.string().optional(),
  components: z.array(z.object({
    name: z.string(),
    type: z.enum(['chelator', 'suspended', 'liquid', 'fertilizer', 'adjuvant', 'oil_concentrate', 'oil']),
    quantity: z.number().positive(),
    unit: z.string(),
    formulaType: z.string().optional(),
    step: z.number()
  })).min(1, 'ต้องมีสารเคมีอย่างน้อย 1 ชนิด')
})

export async function createMixingFormula(data: z.infer<typeof CreateMixingFormulaSchema>) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user) {
      return { success: false, error: 'ไม่ได้รับอนุญาตให้เข้าใช้งาน' }
    }

    // Validate orchard ownership
    const orchard = await prisma.orchard.findFirst({
      where: {
        id: data.orchardId,
        ownerId: session.user.id
      }
    })

    if (!orchard) {
      return { success: false, error: 'ไม่พบสวนที่ระบุ' }
    }

    const validated = CreateMixingFormulaSchema.parse(data)

    const formula = await prisma.mixingFormula.create({
      data: {
        orchardId: validated.orchardId,
        name: validated.name,
        description: validated.description,
        components: validated.components,
        usedCount: 0
      }
    })

    return { success: true, data: formula }
  } catch (error) {
    console.error('Error creating mixing formula:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues?.[0]?.message || 'ข้อมูลไม่ถูกต้อง' }
    }
    return { success: false, error: 'ไม่สามารถสร้างสูตรได้ กรุณาลองใหม่' }
  }
}

export async function getMixingFormulasByOrchard(orchardId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user) {
      return { success: false, error: 'ไม่ได้รับอนุญาตให้เข้าใช้งาน' }
    }

    // Validate orchard ownership
    const orchard = await prisma.orchard.findFirst({
      where: {
        id: orchardId,
        ownerId: session.user.id
      }
    })

    if (!orchard) {
      return { success: false, error: 'ไม่พบสวนที่ระบุ' }
    }

    const formulas = await prisma.mixingFormula.findMany({
      where: { orchardId },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: formulas }
  } catch (error) {
    console.error('Error getting mixing formulas:', error)
    return { success: false, error: 'ไม่สามารถดึงข้อมูลสูตรได้ กรุณาลองใหม่' }
  }
}

export async function updateMixingFormulaUsage(formulaId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user) {
      return { success: false, error: 'ไม่ได้รับอนุญาตให้เข้าใช้งาน' }
    }

    // Verify formula ownership
    const formula = await prisma.mixingFormula.findFirst({
      where: {
        id: formulaId,
        orchard: {
          ownerId: session.user.id
        }
      }
    })

    if (!formula) {
      return { success: false, error: 'ไม่พบสูตรที่ระบุ' }
    }

    const updatedFormula = await prisma.mixingFormula.update({
      where: { id: formulaId },
      data: { usedCount: { increment: 1 } }
    })

    return { success: true, data: updatedFormula }
  } catch (error) {
    console.error('Error updating formula usage:', error)
    return { success: false, error: 'ไม่สามารถอัพเดทการใช้งานสูตรได้ กรุณาลองใหม่' }
  }
}

export async function deleteMixingFormula(formulaId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user) {
      return { success: false, error: 'ไม่ได้รับอนุญาตให้เข้าใช้งาน' }
    }

    // Verify formula ownership
    const formula = await prisma.mixingFormula.findFirst({
      where: {
        id: formulaId,
        orchard: {
          ownerId: session.user.id
        }
      }
    })

    if (!formula) {
      return { success: false, error: 'ไม่พบสูตรที่ระบุ' }
    }

    await prisma.mixingFormula.delete({
      where: { id: formulaId }
    })

    return { success: true, message: 'ลบสูตรสำเร็จ' }
  } catch (error) {
    console.error('Error deleting mixing formula:', error)
    return { success: false, error: 'ไม่สามารถลบสูตรได้ กรุณาลองใหม่' }
  }
}