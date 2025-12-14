'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

// Define all valid chemical types (both old and new for backward compatibility)
const ChemicalTypeSchema = z.enum([
  // New standard abbreviations (46 types)
  // Powder formulations (14)
  'WP', 'WDG', 'GR', 'DF', 'FDF', 'SP', 'SG', 'MG', 'MT', 'WS', 'ZC', 'RB', 'TAB', 'GB',
  // Liquid formulations (13)
  'EC', 'SC', 'SL', 'EW', 'ME', 'OD', 'AC', 'AF', 'WP-SC', 'EC-ME', 'SC-EC', 'UL', 'GE',
  // Special formulations (10)
  'CS', 'WG', 'FS', 'SE', 'PA', 'MC', 'SGST', 'EWOM', 'XL', 'WPEX',
  // Fertilizers (3)
  'FERT', 'ORG', 'LIQ_FERT',
  // Adjuvants (3)
  'SURF', 'STIK', 'SPRD',
  // Additional (3)
  'BR', 'FU', 'TO',
  // Old types for backward compatibility (7)
  'chelator', 'suspended', 'liquid', 'fertilizer', 'adjuvant', 'oil_concentrate', 'oil'
]);

const CreateMixingFormulaSchema = z.object({
  orchardId: z.string().uuid().optional(),
  name: z.string().min(1, 'ชื่อสูตรต้องไม่ว่างเปล่า'),
  description: z.string().optional(),
  components: z.array(z.object({
    name: z.string(),
    type: ChemicalTypeSchema,
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

    const validated = CreateMixingFormulaSchema.parse(data)

    // If orchardId is provided, validate orchard ownership
    if (validated.orchardId) {
      const orchard = await prisma.orchard.findFirst({
        where: {
          id: validated.orchardId,
          ownerId: session.user.id
        }
      })

      if (!orchard) {
        return { success: false, error: 'ไม่พบสวนที่ระบุ' }
      }
    }

    const formula = await prisma.mixingFormula.create({
      data: {
        orchardId: validated.orchardId || null, // Allow null for global formulas
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

    // Get both orchard-specific formulas and global formulas
    const formulas = await prisma.mixingFormula.findMany({
      where: {
        OR: [
          { orchardId }, // Orchard-specific formulas
          { orchardId: null } // Global formulas available to all orchards
        ]
      },
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

    // Verify formula ownership and check dependencies
    const formula = await prisma.mixingFormula.findFirst({
      where: {
        id: formulaId,
        orchard: {
          ownerId: session.user.id
        }
      },
      include: {
        _count: {
          select: {
            activities: true
          }
        }
      }
    })

    if (!formula) {
      return { success: false, error: 'ไม่พบสูตรที่ระบุ' }
    }

    // Check if formula has dependencies
    const activityCount = await prisma.activityLog.count({
      where: { mixingFormulaId: formula.id }
    })

    if (activityCount > 0) {
      return {
        success: false,
        error: `มีกิจกรรมที่ใช้สูตรนี้แล้ว ${activityCount} รายการ ไม่สามารถลบได้`
      }
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

// Global Mixing Formula Functions

const CreateGlobalMixingFormulaSchema = z.object({
  name: z.string().min(1, 'ชื่อสูตรต้องไม่ว่างเปล่า'),
  description: z.string().optional(),
  components: z.array(z.object({
    name: z.string(),
    type: ChemicalTypeSchema,
    quantity: z.number().positive(),
    unit: z.string(),
    formulaType: z.string().optional(),
    step: z.number()
  })).min(1, 'ต้องมีสารเคมีอย่างน้อย 1 ชนิด')
})

export async function createGlobalMixingFormula(data: z.infer<typeof CreateGlobalMixingFormulaSchema>) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user) {
      return { success: false, error: 'ไม่ได้รับอนุญาตให้เข้าใช้งาน' }
    }

    const validated = CreateGlobalMixingFormulaSchema.parse(data)

    // Create formula without orchardId for global access
    const formula = await prisma.mixingFormula.create({
      data: {
        name: validated.name,
        description: validated.description,
        components: validated.components,
        usedCount: 0,
        orchardId: null // Global formula has no orchard
      }
    })

    return { success: true, data: formula }
  } catch (error) {
    console.error('Error creating global mixing formula:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues?.[0]?.message || 'ข้อมูลไม่ถูกต้อง' }
    }
    return { success: false, error: 'ไม่สามารถสร้างสูตรได้ กรุณาลองใหม่' }
  }
}

export async function getGlobalMixingFormulas() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user) {
      return { success: false, error: 'ไม่ได้รับอนุญาตให้เข้าใช้งาน' }
    }

    // Get all formulas that belong to the user (both global and orchard-specific)
    const formulas = await prisma.mixingFormula.findMany({
      where: {
        OR: [
          { orchardId: null }, // Global formulas
          {
            orchard: {
              ownerId: session.user.id
            }
          }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: formulas }
  } catch (error) {
    console.error('Error getting global mixing formulas:', error)
    return { success: false, error: 'ไม่สามารถดึงข้อมูลสูตรได้ กรุณาลองใหม่' }
  }
}

/**
 * Validate if a chemical type is valid
 */
export async function validateChemicalType(type: unknown) {
  const result = ChemicalTypeSchema.safeParse(type);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: 'Invalid chemical type' };
}