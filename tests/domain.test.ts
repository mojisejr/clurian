import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '../lib/prisma'
import { TreeStatus, LogType, LogStatus } from '@prisma/client'

describe('Domain Integration Tests', () => {
  const testUserEmail = `test-domain-${Date.now()}@example.com`
  let userId: string
  let orchardId: string
  let treeId: string

  beforeAll(async () => {
    await prisma.$connect()
    // Create a user for the orchard owner
    const user = await prisma.user.create({
      data: {
        email: testUserEmail,
        name: 'Orchard Owner',
      },
    })
    userId = user.id
  })

  afterAll(async () => {
    // Cleanup in reverse order of dependencies
    if (orchardId) {
      // Cascade delete should handle trees and logs if configured, 
      // but let's be explicit or rely on relation deletion if possible.
      // Prisma doesn't cascade by default unless configured in schema.
      // Schema has:
      // Orchard -> User (owner)
      // Tree -> Orchard
      // ActivityLog -> Orchard, Tree
      
      await prisma.activityLog.deleteMany({ where: { orchardId } }).catch(() => {})
      await prisma.tree.deleteMany({ where: { orchardId } }).catch(() => {})
      await prisma.orchard.delete({ where: { id: orchardId } }).catch(() => {})
    }
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {})
    }
    await prisma.$disconnect()
  })

  it('should create an orchard', async () => {
    const orchard = await prisma.orchard.create({
      data: {
        name: 'Test Orchard',
        ownerId: userId,
        zones: ['Zone A', 'Zone B'],
      },
    })
    expect(orchard).toBeDefined()
    expect(orchard.name).toBe('Test Orchard')
    expect(orchard.zones).toEqual(['Zone A', 'Zone B'])
    orchardId = orchard.id
  })

  it('should create a tree in the orchard', async () => {
    const tree = await prisma.tree.create({
      data: {
        orchardId: orchardId,
        code: 'A01',
        zone: 'Zone A',
        type: 'Durian',
        variety: 'Monthong',
        status: TreeStatus.HEALTHY,
        plantedDate: new Date(),
      },
    })
    expect(tree).toBeDefined()
    expect(tree.code).toBe('A01')
    expect(tree.status).toBe(TreeStatus.HEALTHY)
    treeId = tree.id
  })

  it('should create an activity log for the tree', async () => {
    const log = await prisma.activityLog.create({
      data: {
        orchardId: orchardId,
        treeId: treeId,
        logType: LogType.INDIVIDUAL,
        action: 'Fertilize',
        note: 'Applied NPK 15-15-15',
        performDate: new Date(),
        status: LogStatus.COMPLETED,
      },
    })
    expect(log).toBeDefined()
    expect(log.action).toBe('Fertilize')
    expect(log.treeId).toBe(treeId)
  })

  it('should fetch orchard with trees and logs', async () => {
    const orchard = await prisma.orchard.findUnique({
      where: { id: orchardId },
      include: {
        trees: true,
        logs: true,
      },
    })
    expect(orchard).toBeDefined()
    expect(orchard?.trees).toHaveLength(1)
    expect(orchard?.logs).toHaveLength(1)
    expect(orchard?.trees[0].code).toBe('A01')
  })

  describe('Tree Sorting Utilities', () => {
    it('should extract number from tree code correctly', async () => {
      const { extractNumberFromCode } = await import('../lib/utils/tree-sorting')

      expect(extractNumberFromCode('T1')).toBe(1)
      expect(extractNumberFromCode('T100')).toBe(100)
      expect(extractNumberFromCode('M50')).toBe(50)
      expect(extractNumberFromCode('A001')).toBe(1)
      expect(extractNumberFromCode('B')).toBe(0)
      expect(extractNumberFromCode('C123TEST')).toBe(123)
    })

    it('should extract prefix from tree code correctly', async () => {
      const { extractPrefixFromCode } = await import('../lib/utils/tree-sorting')

      expect(extractPrefixFromCode('T1')).toBe('T')
      expect(extractPrefixFromCode('M50')).toBe('M')
      expect(extractPrefixFromCode('A100')).toBe('A')
      expect(extractPrefixFromCode('ABC123')).toBe('ABC')
      expect(extractPrefixFromCode('123')).toBe('')
    })

    it('should get status priority correctly', async () => {
      const { getStatusPriority } = await import('../lib/utils/tree-sorting')

      expect(getStatusPriority('SICK')).toBe(1)
      expect(getStatusPriority('HEALTHY')).toBe(2)
      expect(getStatusPriority('DEAD')).toBe(3)
      expect(getStatusPriority('ARCHIVED')).toBe(4)
      expect(getStatusPriority('UNKNOWN')).toBe(5)
    })

    // Note: sortTrees tests removed as sorting is now handled at database level
  })
})
