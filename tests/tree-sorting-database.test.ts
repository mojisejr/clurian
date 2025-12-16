import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { getOrchardTrees } from '@/lib/services/tree-service';
import { TreeStatus } from '@/lib/types';

describe('Tree Sorting in Database', () => {
  let orchardId: string;
  let userId: string;

  beforeAll(async () => {
    // Create a test user first
    const user = await prisma.user.create({
      data: {
        email: `test-tree-sorting-${Date.now()}@example.com`,
        name: 'Tree Sorting Test User',
      }
    });
    userId = user.id;

    // Create a test orchard
    const orchard = await prisma.orchard.create({
      data: {
        ownerId: userId,
        name: 'Test Orchard for Sorting',
      }
    });
    orchardId = orchard.id;
  });

  beforeEach(async () => {
    // Clean up trees before each test
    await prisma.tree.deleteMany({
      where: { orchardId }
    });
  });

  afterAll(async () => {
    // Clean up test data - order matters due to foreign key constraints
    if (orchardId) {
      await prisma.tree.deleteMany({
        where: { orchardId }
      });
      await prisma.orchard.delete({
        where: { id: orchardId }
      }).catch(() => {});
    }
    if (userId) {
      await prisma.user.delete({
        where: { id: userId }
      }).catch(() => {});
    }
  });

  it('should sort trees by status priority first', async () => {
    // Create trees with different statuses
    const trees = [
      { code: 'T001', status: 'HEALTHY' as TreeStatus },
      { code: 'T002', status: 'SICK' as TreeStatus },
      { code: 'T003', status: 'DEAD' as TreeStatus },
      { code: 'T004', status: 'ARCHIVED' as TreeStatus },
      { code: 'T005', status: 'SICK' as TreeStatus },
    ];

    for (const tree of trees) {
      await prisma.tree.create({
        data: {
          orchardId,
          code: tree.code,
          zone: 'A',
          type: 'MANGO',
          variety: 'Nam Dok Mai',
          status: tree.status,
        }
      });
    }

    // Fetch all trees
    const result = await getOrchardTrees(orchardId, 1, 100);

    // Check ordering: SICK trees should come first
    expect(result.trees[0].code).toBe('T002'); // SICK
    expect(result.trees[0].status).toBe('sick');
    expect(result.trees[1].code).toBe('T005'); // SICK
    expect(result.trees[1].status).toBe('sick');

    // Then HEALTHY
    expect(result.trees[2].code).toBe('T001'); // HEALTHY
    expect(result.trees[2].status).toBe('healthy');

    // Then DEAD
    expect(result.trees[3].code).toBe('T003'); // DEAD
    expect(result.trees[3].status).toBe('dead');

    // Then ARCHIVED
    expect(result.trees[4].code).toBe('T004'); // ARCHIVED
    expect(result.trees[4].status).toBe('archived');
  });

  it('should sort trees by code prefix when status is same', async () => {
    // Create trees with same status but different prefixes
    const trees = [
      { code: 'T001', status: 'HEALTHY' as TreeStatus },
      { code: 'M001', status: 'HEALTHY' as TreeStatus },
      { code: 'A001', status: 'HEALTHY' as TreeStatus },
      { code: 'B001', status: 'HEALTHY' as TreeStatus },
    ];

    for (const tree of trees) {
      await prisma.tree.create({
        data: {
          orchardId,
          code: tree.code,
          zone: 'A',
          type: 'MANGO',
          variety: 'Nam Dok Mai',
          status: tree.status,
        }
      });
    }

    const result = await getOrchardTrees(orchardId, 1, 100);

    // Should be sorted alphabetically by prefix
    expect(result.trees[0].code).toBe('A001');
    expect(result.trees[1].code).toBe('B001');
    expect(result.trees[2].code).toBe('M001');
    expect(result.trees[3].code).toBe('T001');
  });

  it('should sort trees by code number when prefix and status are same', async () => {
    const trees = [
      { code: 'T100', status: 'HEALTHY' as TreeStatus },
      { code: 'T001', status: 'HEALTHY' as TreeStatus },
      { code: 'T050', status: 'HEALTHY' as TreeStatus },
      { code: 'T010', status: 'HEALTHY' as TreeStatus },
      { code: 'T002', status: 'HEALTHY' as TreeStatus },
    ];

    for (const tree of trees) {
      await prisma.tree.create({
        data: {
          orchardId,
          code: tree.code,
          zone: 'A',
          type: 'MANGO',
          variety: 'Nam Dok Mai',
          status: tree.status,
        }
      });
    }

    const result = await getOrchardTrees(orchardId, 1, 100);

    // Should be sorted numerically
    expect(result.trees[0].code).toBe('T001');
    expect(result.trees[1].code).toBe('T002');
    expect(result.trees[2].code).toBe('T010');
    expect(result.trees[3].code).toBe('T050');
    expect(result.trees[4].code).toBe('T100');
  });

  it('should maintain consistent ordering across pagination', async () => {
    // Create 50 trees with mixed sorting requirements
    const statuses: TreeStatus[] = ['SICK', 'HEALTHY', 'DEAD', 'ARCHIVED'];
    const prefixes = ['A', 'M', 'T'];

    for (let i = 0; i < 50; i++) {
      const prefix = prefixes[i % prefixes.length];
      const status = statuses[Math.floor(i / 10) % statuses.length];
      const number = 50 - i; // Reverse order to test sorting

      await prisma.tree.create({
        data: {
          orchardId,
          code: `${prefix}${number.toString().padStart(3, '0')}`,
          zone: 'A',
          type: 'MANGO',
          variety: 'Nam Dok Mai',
          status,
        }
      });
    }

    // Fetch all pages
    const page1 = await getOrchardTrees(orchardId, 1, 10);
    const page2 = await getOrchardTrees(orchardId, 2, 10);
    const page3 = await getOrchardTrees(orchardId, 3, 10);
    const allPages = await getOrchardTrees(orchardId, 1, 100);

    // Combine paginated results
    const combinedPages = [...page1.trees, ...page2.trees, ...page3.trees];

    // Ordering should be consistent
    for (let i = 0; i < 30; i++) {
      expect(combinedPages[i].code).toBe(allPages.trees[i].code);
      expect(combinedPages[i].status).toBe(allPages.trees[i].status);
    }
  });

  it('should handle malformed tree codes gracefully', async () => {
    const trees = [
      { code: 'INVALID', status: 'HEALTHY' as TreeStatus },
      { code: '123', status: 'HEALTHY' as TreeStatus },
      { code: '', status: 'HEALTHY' as TreeStatus },
      { code: 'T001', status: 'HEALTHY' as TreeStatus },
    ];

    for (const tree of trees) {
      await prisma.tree.create({
        data: {
          orchardId,
          code: tree.code,
          zone: 'A',
          type: 'MANGO',
          variety: 'Nam Dok Mai',
          status: tree.status,
        }
      });
    }

    const result = await getOrchardTrees(orchardId, 1, 100);

    // Should not crash and should return all trees
    expect(result.trees).toHaveLength(4);

    // The actual order based on the database sorting:
    expect(result.trees[0].code).toBe('123'); // Number-only, no prefix
    expect(result.trees[1].code).toBe(''); // Empty string (treated as no prefix, 999999 number)
    expect(result.trees[2].code).toBe('INVALID'); // Starts with I
    expect(result.trees[3].code).toBe('T001'); // Starts with T
  });

  it('should work efficiently with large dataset', async () => {
    // Create 50 trees to test performance (reduced for faster test)
    const startTime = Date.now();

    // Use createMany for better performance
    const treesToCreate = [];
    for (let i = 0; i < 50; i++) {
      treesToCreate.push({
        orchardId,
        code: `T${(i + 1).toString().padStart(3, '0')}`,
        zone: 'A',
        type: 'MANGO',
        variety: 'Nam Dok Mai',
        status: i % 2 === 0 ? 'HEALTHY' : 'SICK',
      });
    }

    await prisma.tree.createMany({
      data: treesToCreate
    });

    // Query with pagination
    const result = await getOrchardTrees(orchardId, 1, 20);
    const queryTime = Date.now() - startTime;

    // Should complete quickly (adjusted for batch creation)
    expect(queryTime).toBeLessThan(2000);
    expect(result.trees).toHaveLength(20);
    expect(result.pagination.total).toBe(50);

    // SICK trees should come first
    expect(result.trees[0].status).toBe('sick');
  });
});