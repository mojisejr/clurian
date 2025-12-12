import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'

describe('ActivityLog and MixingFormula Integration', () => {
  const testUserEmail = `test-integration-mixing-${Date.now()}@example.com`
  let testUserId: string
  let testOrchardId: string
  let testFormulaId: string

  beforeAll(async () => {
    await prisma.$connect()
  })

  afterAll(async () => {
    // Cleanup
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {})
    }
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    // Clean up test data using a unique identifier
    const testId = Date.now()
    await prisma.activityLog.deleteMany({
      where: { note: { contains: `INTEGRATION_TEST_${testId}` } }
    })
    await prisma.mixingFormula.deleteMany({
      where: { name: { contains: `INTEGRATION_TEST_${testId}` } }
    })
    await prisma.tree.deleteMany({
      where: { code: { contains: `TEST${testId}` } }
    })
    await prisma.orchard.deleteMany({
      where: { name: { contains: `INTEGRATION_TEST_${testId}` } }
    })
    await prisma.user.deleteMany({
      where: { email: { contains: `test-integration-mixing-${testId}` } }
    })

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: `test-integration-mixing-${testId}@example.com`,
        name: 'Integration Test User for Mixing',
      },
    })
    testUserId = user.id

    // Create test orchard
    const orchard = await prisma.orchard.create({
      data: {
        ownerId: testUserId,
        name: `INTEGRATION_TEST_${testId} Orchid`,
        zones: ['A', 'B']
      }
    })
    testOrchardId = orchard.id
  })

  it('should create activity log with mixing formula reference', async () => {
    const testId = Date.now()

    // Step 1: Create a mixing formula directly with Prisma
    const formula = await prisma.mixingFormula.create({
      data: {
        orchardId: testOrchardId,
        name: `INTEGRATION_TEST_${testId} Formula`,
        description: 'Test formula for integration',
        components: [
          { name: 'EDTA', type: 'chelator', quantity: 100, unit: 'g', step: 1 },
          { name: 'Test Pesticide', type: 'suspended', quantity: 200, unit: 'g', step: 2 }
        ]
      }
    })
    testFormulaId = formula.id

    // Step 2: Create activity log with mixing formula reference
    const activity = await prisma.activityLog.create({
      data: {
        orchardId: testOrchardId,
        logType: 'BATCH',
        targetZone: 'A',
        action: 'พ่นยากำจัดแมลง',
        note: `INTEGRATION_TEST_${testId}: Used test formula`,
        performDate: new Date('2024-01-15'),
        mixingFormulaId: testFormulaId
      }
    })

    expect(activity.mixingFormulaId).toBe(testFormulaId)
  })

  it('should retrieve activity log with mixing formula details', async () => {
    const testId = Date.now()

    // Step 1: Create formula
    const formula = await prisma.mixingFormula.create({
      data: {
        orchardId: testOrchardId,
        name: `INTEGRATION_TEST_${testId} Formula for Retrieval`,
        components: [
          { name: 'Test Chemical', type: 'liquid', quantity: 150, unit: 'ml', step: 1 }
        ]
      }
    })

    // Step 2: Create activity log with formula reference
    const activity = await prisma.activityLog.create({
      data: {
        orchardId: testOrchardId,
        logType: 'BATCH',
        targetZone: 'B',
        action: 'พ่นยา',
        note: `INTEGRATION_TEST_${testId}: Retrieval test`,
        performDate: new Date('2024-01-16'),
        mixingFormulaId: formula.id
      }
    })

    // Step 3: Retrieve with join
    const activityWithFormula = await prisma.activityLog.findUnique({
      where: { id: activity.id },
      include: {
        mixingFormula: true
      }
    })

    expect(activityWithFormula).toBeDefined()
    expect(activityWithFormula!.mixingFormula).toBeDefined()
    expect(activityWithFormula!.mixingFormula!.name).toBe(`INTEGRATION_TEST_${testId} Formula for Retrieval`)
  })

  it('should query activities by mixing formula', async () => {
    const testId = Date.now()

    // Step 1: Create formula
    const formula = await prisma.mixingFormula.create({
      data: {
        orchardId: testOrchardId,
        name: `INTEGRATION_TEST_${testId} Popular Formula`,
        components: [
          { name: 'Popular Chemical', type: 'liquid', quantity: 100, unit: 'ml', step: 1 }
        ]
      }
    })

    // Step 2: Create multiple activities using the same formula
    const dates = ['2024-01-15', '2024-01-20', '2024-01-25']
    for (const dateStr of dates) {
      await prisma.activityLog.create({
        data: {
          orchardId: testOrchardId,
          logType: 'BATCH',
          targetZone: 'A',
          action: 'พ่นยา',
          note: `INTEGRATION_TEST_${testId}: Used on ${dateStr}`,
          performDate: new Date(dateStr),
          mixingFormulaId: formula.id
        }
      })
    }

    // Step 3: Query activities by formula
    const formulaActivities = await prisma.activityLog.findMany({
      where: {
        mixingFormulaId: formula.id
      },
      orderBy: {
        performDate: 'desc'
      }
    })

    expect(formulaActivities).toHaveLength(3)
    expect(formulaActivities[0].note).toContain('2024-01-25')
  })

  it('should handle null mixingFormulaId gracefully', async () => {
    const testId = Date.now()

    // Create a test tree first
    const tree = await prisma.tree.create({
      data: {
        orchardId: testOrchardId,
        code: `TEST${testId}`,
        zone: 'A',
        type: 'ไม้ผล',
        variety: 'สับปะรด',
        status: 'HEALTHY'
      }
    })

    // Create activity without mixing formula
    const activity = await prisma.activityLog.create({
      data: {
        orchardId: testOrchardId,
        logType: 'INDIVIDUAL',
        treeId: tree.id, // Use actual tree ID
        action: 'ตัดแต่งกิ่ง',
        note: `INTEGRATION_TEST_${testId}: Regular activity without formula`,
        performDate: new Date('2024-01-15')
        // No mixingFormulaId - should be null/optional
      }
    })

    expect(activity.mixingFormulaId).toBeNull()
  })

  it('should check formula usage count', async () => {
    const testId = Date.now()

    // Step 1: Create formula
    const formula = await prisma.mixingFormula.create({
      data: {
        orchardId: testOrchardId,
        name: `INTEGRATION_TEST_${testId} Used Formula`,
        components: [
          { name: 'Test Chemical', type: 'fertilizer', quantity: 200, unit: 'g', step: 1 }
        ]
      }
    })

    // Initially, no activities
    const formulaInitially = await prisma.mixingFormula.findUnique({
      where: { id: formula.id },
      include: { _count: { select: { activities: true } } }
    })
    expect(formulaInitially!._count.activities).toBe(0)

    // Step 2: Create activity log that references the formula
    await prisma.activityLog.create({
      data: {
        orchardId: testOrchardId,
        logType: 'BATCH',
        targetZone: 'A',
        action: 'ใส่ปุ๋ย',
        note: `INTEGRATION_TEST_${testId}: Usage test`,
        performDate: new Date('2024-01-17'),
        mixingFormulaId: formula.id
      }
    })

    // Step 3: Check usage count
    const formulaWithActivities = await prisma.mixingFormula.findUnique({
      where: { id: formula.id },
      include: { _count: { select: { activities: true } } }
    })
    expect(formulaWithActivities!._count.activities).toBe(1)
  })
})