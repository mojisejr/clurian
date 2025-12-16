import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { getOrchardTrees } from '@/lib/services/tree-service';
import { TreeStatus } from '@prisma/client';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    tree: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

// Mock tree sorting
vi.mock('@/lib/utils/tree-sorting', () => ({
  sortTrees: vi.fn((trees) => trees), // Just return as-is for simplicity
}));

describe('Tree Service - Filtering', () => {
  const mockOrchardId = 'test-orchard-id';

  // Helper function to create mock tree
  const createMockTree = (overrides: any = {}) => ({
    id: 'tree-1',
    orchardId: mockOrchardId,
    code: 'T001',
    zone: 'A',
    type: 'ทุเรียน',
    variety: 'หมอนทอง',
    status: 'HEALTHY',
    plantedDate: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Status filtering', () => {
    it('should filter trees by HEALTHY status (uppercase)', async () => {
      const mockTrees = [
        createMockTree({ id: '1', code: 'T001' }),
        createMockTree({ id: '2', code: 'T002' }),
      ];

      vi.mocked(prisma.tree.findMany).mockResolvedValue(mockTrees as any);
      vi.mocked(prisma.tree.count).mockResolvedValue(2);

      const result = await getOrchardTrees(mockOrchardId, 1, 20, {
        status: 'HEALTHY' as TreeStatus,
      });

      expect(prisma.tree.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            orchardId: mockOrchardId,
            status: 'HEALTHY',
          }),
        })
      );

      expect(result.trees).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter trees by SICK status', async () => {
      const mockTrees = [
        { id: '1', status: 'SICK', code: 'T003' },
      ];

      vi.mocked(prisma.tree.findMany).mockResolvedValue(mockTrees as any);
      vi.mocked(prisma.tree.count).mockResolvedValue(1);

      const result = await getOrchardTrees(mockOrchardId, 1, 20, {
        status: 'SICK' as TreeStatus,
      });

      expect(prisma.tree.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'SICK',
          }),
        })
      );

      expect(result.trees).toHaveLength(1);
    });

    it('should return all trees when no status filter is provided', async () => {
      const mockTrees = [
        { id: '1', status: 'HEALTHY', code: 'T001' },
        { id: '2', status: 'SICK', code: 'T002' },
        { id: '3', status: 'DEAD', code: 'T003' },
      ];

      vi.mocked(prisma.tree.findMany).mockResolvedValue(mockTrees as any);
      vi.mocked(prisma.tree.count).mockResolvedValue(3);

      const result = await getOrchardTrees(mockOrchardId, 1, 20, {});

      expect(prisma.tree.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            orchardId: mockOrchardId,
          }),
        })
      );

      // Should not include status in where clause
      const whereClause = vi.mocked(prisma.tree.findMany).mock.calls[0][0].where;
      expect(whereClause).not.toHaveProperty('status');

      expect(result.trees).toHaveLength(3);
    });
  });

  describe('Zone filtering', () => {
    it('should filter trees by zone', async () => {
      const mockTrees = [
        { id: '1', status: 'HEALTHY', code: 'T001', zone: 'A' },
        { id: '2', status: 'HEALTHY', code: 'T002', zone: 'A' },
      ];

      vi.mocked(prisma.tree.findMany).mockResolvedValue(mockTrees as any);
      vi.mocked(prisma.tree.count).mockResolvedValue(2);

      const result = await getOrchardTrees(mockOrchardId, 1, 20, {
        zone: 'A',
      });

      expect(prisma.tree.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            orchardId: mockOrchardId,
            zone: 'A',
          }),
        })
      );

      expect(result.trees).toHaveLength(2);
    });
  });

  describe('Search term filtering', () => {
    it('should filter trees by code search term', async () => {
      const mockTrees = [
        { id: '1', status: 'HEALTHY', code: 'SEARCH001', zone: 'A' },
      ];

      vi.mocked(prisma.tree.findMany).mockResolvedValue(mockTrees as any);
      vi.mocked(prisma.tree.count).mockResolvedValue(1);

      const result = await getOrchardTrees(mockOrchardId, 1, 20, {
        searchTerm: 'SEARCH',
      });

      expect(prisma.tree.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { code: { contains: 'SEARCH', mode: 'insensitive' } },
              { variety: { contains: 'SEARCH', mode: 'insensitive' } },
            ],
          }),
        })
      );

      expect(result.trees).toHaveLength(1);
    });

    it('should filter trees by variety search term', async () => {
      const mockTrees = [
        { id: '1', status: 'HEALTHY', code: 'T001', variety: 'Monthong', zone: 'A' },
      ];

      vi.mocked(prisma.tree.findMany).mockResolvedValue(mockTrees as any);
      vi.mocked(prisma.tree.count).mockResolvedValue(1);

      const result = await getOrchardTrees(mockOrchardId, 1, 20, {
        searchTerm: 'month',
      });

      expect(prisma.tree.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { code: { contains: 'month', mode: 'insensitive' } },
              { variety: { contains: 'month', mode: 'insensitive' } },
            ],
          }),
        })
      );

      expect(result.trees).toHaveLength(1);
    });
  });

  describe('Combined filters', () => {
    it('should filter by status and zone together', async () => {
      const mockTrees = [
        { id: '1', status: 'SICK', code: 'T001', zone: 'B' },
      ];

      vi.mocked(prisma.tree.findMany).mockResolvedValue(mockTrees as any);
      vi.mocked(prisma.tree.count).mockResolvedValue(1);

      const result = await getOrchardTrees(mockOrchardId, 1, 20, {
        status: 'SICK' as TreeStatus,
        zone: 'B',
      });

      expect(prisma.tree.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            orchardId: mockOrchardId,
            status: 'SICK',
            zone: 'B',
          }),
        })
      );

      expect(result.trees).toHaveLength(1);
    });

    it('should filter by status, zone, and search term together', async () => {
      const mockTrees = [
        { id: '1', status: 'HEALTHY', code: 'SPECIAL001', zone: 'A' },
      ];

      vi.mocked(prisma.tree.findMany).mockResolvedValue(mockTrees as any);
      vi.mocked(prisma.tree.count).mockResolvedValue(1);

      const result = await getOrchardTrees(mockOrchardId, 1, 20, {
        status: 'HEALTHY' as TreeStatus,
        zone: 'A',
        searchTerm: 'special',
      });

      expect(prisma.tree.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            orchardId: mockOrchardId,
            status: 'HEALTHY',
            zone: 'A',
            OR: [
              { code: { contains: 'special', mode: 'insensitive' } },
              { variety: { contains: 'special', mode: 'insensitive' } },
            ],
          }),
        })
      );

      expect(result.trees).toHaveLength(1);
    });
  });

  describe('Pagination', () => {
    it('should handle pagination correctly', async () => {
      const mockTrees = Array.from({ length: 20 }, (_, i) => ({
        id: `tree-${i}`,
        status: 'HEALTHY',
        code: `T${String(i + 1).padStart(3, '0')}`,
      }));

      vi.mocked(prisma.tree.findMany).mockResolvedValue(mockTrees as any);
      vi.mocked(prisma.tree.count).mockResolvedValue(100);

      const result = await getOrchardTrees(mockOrchardId, 2, 20, {});

      expect(prisma.tree.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20, // (page - 1) * limit = 20
          take: 20,
        })
      );

      expect(result.pagination).toEqual({
        page: 2,
        limit: 20,
        total: 100,
        totalPages: 5,
        hasNext: true,
        hasPrev: true,
      });
    });
  });

  describe('Error handling', () => {
    it('should return empty result when database query fails', async () => {
      vi.mocked(prisma.tree.findMany).mockRejectedValue(new Error('Database error'));

      const result = await getOrchardTrees(mockOrchardId, 1, 20, {});

      expect(result.trees).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });
});