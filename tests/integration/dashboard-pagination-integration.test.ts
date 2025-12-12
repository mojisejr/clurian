import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { getOrchardData } from '@/app/actions/orchards'
import * as orchardService from '@/lib/services/orchard-service'
import type { Tree } from '@/lib/types'

describe('Dashboard Pagination Integration Tests', () => {
  const testUserEmail = `test-pagination-${Date.now()}@example.com`
  let userId: string
  let orchardId: string
  let createdTrees: string[] = []

  beforeAll(async () => {
    // Ensure connection
    await prisma.$connect()
  })

  afterAll(async () => {
    // Cleanup created trees
    if (createdTrees.length > 0) {
      await prisma.tree.deleteMany({
        where: {
          id: {
            in: createdTrees
          }
        }
      })
    }

    // Cleanup orchard
    if (orchardId) {
      await prisma.orchard.delete({ where: { id: orchardId } }).catch(() => {})
    }

    // Cleanup user
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {})
    }

    await prisma.$disconnect()
  })

  beforeEach(async () => {
    // Reset created trees array
    createdTrees = []
  })

  describe('Database Layer Tests', () => {
    it('should create test user and orchard', async () => {
      // Create user
      const user = await prisma.user.create({
        data: {
          email: testUserEmail,
          name: 'Pagination Test User',
        },
      })
      userId = user.id
      expect(user.id).toBeDefined()

      // Create orchard
      const orchard = await prisma.orchard.create({
        data: {
          ownerId: userId,
          name: 'Test Pagination Orchard',
          zones: ['A', 'B', 'C']
        },
      })
      orchardId = orchard.id
      expect(orchard.id).toBeDefined()
    })

    it('should create exactly 100 trees', async () => {
      const trees: Array<{ code: string; zone: string; type: string; variety: string; status: 'HEALTHY' | 'SICK' | 'DEAD' | 'ARCHIVED' }> = []

      for (let i = 1; i <= 100; i++) {
        const zone = String.fromCharCode(65 + (i % 3)) // A, B, C
        const status = i % 20 === 0 ? 'SICK' : i % 50 === 0 ? 'DEAD' : 'HEALTHY'

        trees.push({
          code: `T${String(i).padStart(3, '0')}`,
          zone,
          type: 'ทุเรียน',
          variety: 'หมอนทอง',
          status
        })
      }

      // Create all trees in batch
      const createdTreeRecords = await prisma.$transaction(
        trees.map(tree =>
          prisma.tree.create({
            data: {
              orchardId,
              ...tree
            },
            select: { id: true }
          })
        )
      )

      createdTrees.push(...createdTreeRecords.map(t => t.id))
      expect(createdTrees.length).toBe(100)

      // Verify count
      const treeCount = await prisma.tree.count({
        where: { orchardId }
      })
      expect(treeCount).toBe(100)
    })

    it('should demonstrate the current bug: getOrchardData with 100 trees', async () => {
      // Act
      const result = await orchardService.getOrchardData(orchardId)

      // Assert - This will pass with current implementation
      expect(result.trees).toHaveLength(100)
      expect(result.trees[0].code).toBe('T001')
      expect(result.trees[99].code).toBe('T100')
    })

    it('should demonstrate the current bug: getOrchardData with more than 100 trees', async () => {
      // Create 50 more trees (total 150)
      const additionalTrees: Array<{ code: string; zone: string; type: string; variety: string; status: 'HEALTHY' | 'SICK' | 'DEAD' | 'ARCHIVED' }> = []

      for (let i = 101; i <= 150; i++) {
        const zone = String.fromCharCode(65 + (i % 3))
        const status = i % 25 === 0 ? 'SICK' : 'HEALTHY'

        additionalTrees.push({
          code: `T${String(i).padStart(3, '0')}`,
          zone,
          type: 'ทุเรียน',
          variety: 'หมอนทอง',
          status
        })
      }

      const createdAdditionalTrees = await prisma.$transaction(
        additionalTrees.map(tree =>
          prisma.tree.create({
            data: {
              orchardId,
              ...tree
            },
            select: { id: true }
          })
        )
      )

      createdTrees.push(...createdAdditionalTrees.map(t => t.id))

      // Verify total count in database
      const totalTreeCount = await prisma.tree.count({
        where: { orchardId }
      })
      expect(totalTreeCount).toBe(150)

      // Act - This is where the bug manifests
      const result = await orchardService.getOrchardData(orchardId)

      // Assert - The bug: Still returns only 100 trees
      expect(result.trees).toHaveLength(100) // Bug! Should be 150
      expect(result.trees[0].code).toBe('T001')
      expect(result.trees[99].code).toBe('T100')

      // Trees beyond 100 are missing
      const treeCodes = result.trees.map(t => t.code)
      expect(treeCodes).not.toContain('T101')
      expect(treeCodes).not.toContain('T150')
    })

    it('should show that getOrchardTrees works correctly with pagination', async () => {
      // This demonstrates that the proper paginated service works
      const page1 = await orchardService.getOrchardTrees(orchardId, 1, 20)

      expect(page1.trees).toHaveLength(20)
      expect(page1.trees[0].code).toBe('T001')
      expect(page1.trees[19].code).toBe('T020')
      expect(page1.pagination.total).toBe(150)
      expect(page1.pagination.totalPages).toBe(8) // 150/20 = 7.5 → 8 pages

      const page2 = await orchardService.getOrchardTrees(orchardId, 2, 20)
      expect(page2.trees).toHaveLength(20)
      expect(page2.trees[0].code).toBe('T021')
      expect(page2.trees[19].code).toBe('T040')

      const page8 = await orchardService.getOrchardTrees(orchardId, 8, 20)
      expect(page8.trees).toHaveLength(10) // Last page has fewer items
      expect(page8.trees[0].code).toBe('T141')
      expect(page8.trees[9].code).toBe('T150')
    })
  })

  describe('Server Action Tests', () => {
    it('should test getOrchardData server action with pagination bug', async () => {
      // This tests the server action that the dashboard uses
      const result = await getOrchardData(orchardId)

      // The bug: Only returns 100 trees
      expect(result.trees).toHaveLength(100)

      // Count healthy trees (should be more than what's returned)
      const actualHealthyCount = await prisma.tree.count({
        where: {
          orchardId,
          status: { not: 'ARCHIVED' }
        }
      })

      const returnedHealthyCount = result.trees.filter(t => t.status !== 'archived').length

      // This demonstrates the discrepancy
      expect(actualHealthyCount).toBeGreaterThan(returnedHealthyCount)
      expect(actualHealthyCount).toBe(145) // 150 - 5 sick/dead
      expect(returnedHealthyCount).toBe(95)  // Only 100 returned - 5 sick/dead
    })
  })

  describe('Performance Tests', () => {
    it('should measure performance difference between approaches', async () => {
      // Create 500 more trees to test performance
      const manyTrees: Array<{ code: string; zone: string; type: string; variety: string; status: 'HEALTHY' | 'SICK' | 'DEAD' | 'ARCHIVED' }> = []

      for (let i = 151; i <= 650; i++) {
        const zone = String.fromCharCode(65 + (i % 3))
        const status = i % 30 === 0 ? 'SICK' : 'HEALTHY'

        manyTrees.push({
          code: `T${String(i).padStart(3, '0')}`,
          zone,
          type: 'ทุเรียน',
          variety: 'หมอนทอง',
          status
        })
      }

      const startTime1 = performance.now()
      const createdManyTrees = await prisma.$transaction(
        manyTrees.map(tree =>
          prisma.tree.create({
            data: {
              orchardId,
              ...tree
            },
            select: { id: true }
          })
        )
      )
      const endTime1 = performance.now()
      console.log(`Creating 500 trees took ${endTime1 - startTime1}ms`)

      createdTrees.push(...createdManyTrees.map(t => t.id))

      // Total trees now: 650
      const totalTreeCount = await prisma.tree.count({
        where: { orchardId }
      })
      expect(totalTreeCount).toBe(650)

      // Test current approach (getOrchardData with take: 100)
      const startTime2 = performance.now()
      const resultLimited = await orchardService.getOrchardData(orchardId)
      const endTime2 = performance.now()
      console.log(`getOrchardData (limited) took ${endTime2 - startTime2}ms`)

      // Test proper approach (getOrchardTrees)
      const startTime3 = performance.now()
      const resultPaginated = await orchardService.getOrchardTrees(orchardId, 1, 100)
      const endTime3 = performance.now()
      console.log(`getOrchardTrees (paginated) took ${endTime3 - startTime3}ms`)

      // Assert
      expect(resultLimited.trees).toHaveLength(100) // Bug: Still limited
      expect(resultPaginated.trees).toHaveLength(100) // Correct: Properly paginated
      expect(resultPaginated.pagination.total).toBe(650)
    })
  })

  describe('Edge Cases', () => {
    it('should handle exactly 100 trees boundary', async () => {
      // Create a new orchard for this specific test
      const testOrchard = await prisma.orchard.create({
        data: {
          ownerId: userId,
          name: 'Boundary Test Orchard',
          zones: ['A']
        }
      })
      const testOrchardId = testOrchard.id

      // Create exactly 100 trees
      const boundaryTrees: Array<{ code: string; zone: string; type: string; variety: string; status: 'HEALTHY' }> = []

      for (let i = 1; i <= 100; i++) {
        boundaryTrees.push({
          code: `B${String(i).padStart(3, '0')}`,
          zone: 'A',
          type: 'ทุเรียน',
          variety: 'หมอนทอง',
          status: 'HEALTHY'
        })
      }

      const createdBoundaryTrees = await prisma.$transaction(
        boundaryTrees.map(tree =>
          prisma.tree.create({
            data: {
              orchardId: testOrchardId,
              ...tree
            },
            select: { id: true }
          })
        )
      )

      // Test boundary
      const result = await orchardService.getOrchardData(testOrchardId)
      expect(result.trees).toHaveLength(100)

      // Cleanup
      const boundaryTreeIds = createdBoundaryTrees.map(t => t.id)
      await prisma.tree.deleteMany({
        where: {
          id: {
            in: boundaryTreeIds
          }
        }
      })
      await prisma.orchard.delete({ where: { id: testOrchardId } })
    })
  })
})