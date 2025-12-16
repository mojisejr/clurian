import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '../lib/prisma'
import { TreeStatus } from '@prisma/client'
import * as treeService from '../lib/services/tree-service'

describe('Database Integration Tests', () => {
  const testUserEmail = `test-integration-${Date.now()}@example.com`
  let userId: string

  beforeAll(async () => {
    // Ensure connection
    await prisma.$connect()
  })

  afterAll(async () => {
    // Cleanup
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {})
    }
    await prisma.$disconnect()
  })

  it('should connect to the database', async () => {
    const result = await prisma.$queryRaw`SELECT 1`
    expect(result).toBeTruthy()
  })

  it('should create a new user', async () => {
    const user = await prisma.user.create({
      data: {
        email: testUserEmail,
        name: 'Integration Test User',
      },
    })
    expect(user).toBeDefined()
    expect(user.email).toBe(testUserEmail)
    userId = user.id
  })

  it('should fetch the created user', async () => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    expect(user).toBeDefined()
    expect(user?.name).toBe('Integration Test User')
  })

  it('should update the user', async () => {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name: 'Updated Test User' },
    })
    expect(updatedUser.name).toBe('Updated Test User')
  })

  it('should delete the user', async () => {
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    })
    expect(deletedUser.id).toBe(userId)

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    expect(user).toBeNull()
    userId = '' // Prevent cleanup from trying to delete again
  })

  describe('Database Tree Sorting', () => {
    const orchardTestEmail = `test-orchard-sort-${Date.now()}@example.com`
    let orchardUserId: string
    let orchardId: string

    beforeAll(async () => {
      const user = await prisma.user.create({
        data: {
          email: orchardTestEmail,
          name: 'Orchard Sort Test User',
        },
      })
      orchardUserId = user.id

      const orchard = await prisma.orchard.create({
        data: {
          name: 'Test Orchard for Sorting',
          ownerId: orchardUserId,
          zones: ['Zone A'],
        },
      })
      orchardId = orchard.id
    })

    afterAll(async () => {
      // Cleanup
      await prisma.activityLog.deleteMany({ where: { orchardId } }).catch(() => {})
      await prisma.tree.deleteMany({ where: { orchardId } }).catch(() => {})
      await prisma.orchard.delete({ where: { id: orchardId } }).catch(() => {})
      await prisma.user.delete({ where: { id: orchardUserId } }).catch(() => {})
    })

    it('should sort trees by status priority and code correctly using client-side sorting', async () => {
      // Create test trees with different statuses and codes
      const testTrees = [
        { code: 'T100', status: 'HEALTHY', zone: 'Zone A' },
        { code: 'M50', status: 'SICK', zone: 'Zone A' },
        { code: 'T1', status: 'HEALTHY', zone: 'Zone A' },
        { code: 'A200', status: 'DEAD', zone: 'Zone A' },
        { code: 'T20', status: 'SICK', zone: 'Zone A' },
        { code: 'M10', status: 'HEALTHY', zone: 'Zone A' },
        { code: 'A1', status: 'ARCHIVED', zone: 'Zone A' },
      ]

      // Insert trees
      for (const tree of testTrees) {
        await prisma.tree.create({
          data: {
            orchardId,
            code: tree.code,
            zone: tree.zone,
            type: 'Durian',
            variety: 'Monthong',
            status: tree.status as TreeStatus,
            plantedDate: new Date(),
          },
        })
      }

      // Test the tree service with client-side sorting
      const { trees: sortedTrees } = await treeService.getOrchardTrees(orchardId, 1, 100);

      // Expected order (by status priority, then prefix alphabetically, then number):
      // 1. SICK trees: M50 (M prefix, 50), T20 (T prefix, 20)
      // 2. HEALTHY trees: M10 (M prefix, 10), T1 (T prefix, 1), T100 (T prefix, 100)
      // 3. DEAD trees: A200 (A prefix, 200)
      // 4. ARCHIVED trees: A1 (A prefix, 1)

      expect(sortedTrees).toHaveLength(7)

      // Check SICK trees come first
      expect(sortedTrees[0].code).toBe('M50')
      expect(sortedTrees[0].status).toBe('sick')
      expect(sortedTrees[1].code).toBe('T20')
      expect(sortedTrees[1].status).toBe('sick')

      // Check HEALTHY trees come next, sorted by prefix then number
      expect(sortedTrees[2].code).toBe('M10')
      expect(sortedTrees[2].status).toBe('healthy')
      expect(sortedTrees[3].code).toBe('T1')
      expect(sortedTrees[3].status).toBe('healthy')

      // Check HEALTHY tree (T100)
      expect(sortedTrees[4].code).toBe('T100')
      expect(sortedTrees[4].status).toBe('healthy')

      // Check DEAD tree
      expect(sortedTrees[5].code).toBe('A200')
      expect(sortedTrees[5].status).toBe('dead')

      // Check ARCHIVED tree
      expect(sortedTrees[6].code).toBe('A1')
      expect(sortedTrees[6].status).toBe('archived')
    })

    it('should handle pagination with sorting correctly', async () => {
      // Clean up any existing trees first
      await prisma.tree.deleteMany({ where: { orchardId } }).catch(() => {});

      // Create test trees for pagination test with unique codes
      const testTrees = [
        { code: 'P100', status: 'HEALTHY', zone: 'Zone A' },
        { code: 'N50', status: 'SICK', zone: 'Zone A' },
        { code: 'P1', status: 'HEALTHY', zone: 'Zone A' },
        { code: 'B200', status: 'DEAD', zone: 'Zone A' },
        { code: 'P20', status: 'SICK', zone: 'Zone A' },
        { code: 'N10', status: 'HEALTHY', zone: 'Zone A' },
        { code: 'B1', status: 'ARCHIVED', zone: 'Zone A' },
      ];

      // Insert trees for pagination test
      for (const tree of testTrees) {
        await prisma.tree.create({
          data: {
            orchardId,
            code: tree.code,
            zone: tree.zone,
            type: 'Durian',
            variety: 'Monthong',
            status: tree.status as TreeStatus,
            plantedDate: new Date(),
          },
        });
      }

      // Test pagination with the tree service
      const page1 = await treeService.getOrchardTrees(orchardId, 1, 3);
      const page2 = await treeService.getOrchardTrees(orchardId, 2, 3);

      // Check that pagination works
      expect(page1.trees).toHaveLength(3)
      expect(page2.trees).toHaveLength(3)

      // Check that pagination returns different trees
      const page1Codes = page1.trees.map(t => t.code)
      const page2Codes = page2.trees.map(t => t.code)

      // Ensure no overlap between pages
      const overlap = page1Codes.filter(code => page2Codes.includes(code))
      expect(overlap).toHaveLength(0)

      // Check that we have correct total
      expect(page1.pagination.total).toBe(7)
      expect(page1.pagination.totalPages).toBe(3)

      // Check that page numbers are correct
      expect(page1.pagination.page).toBe(1)
      expect(page2.pagination.page).toBe(2)

      // Check that there's a next page for page 1
      expect(page1.pagination.hasNext).toBe(true)
      expect(page1.pagination.hasPrev).toBe(false)

      // Check that page 2 has prev/next
      expect(page2.pagination.hasPrev).toBe(true)
      expect(page2.pagination.hasNext).toBe(true)
    })
  })
})
