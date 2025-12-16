import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getOrchardTreesServer } from '@/app/actions/orchards';
import { useOrchardTrees } from '@/lib/hooks/use-orchard-queries';

// Mock server actions
vi.mock('@/app/actions/orchards', () => ({
  getOrchardTreesServer: vi.fn(),
}));

// Mock error handling
vi.mock('@/lib/errors', () => ({
  handleServiceError: vi.fn((error, context) => {
    console.error(`Error in ${context}:`, error);
    throw error;
  }),
}));

describe('Dashboard Tree Listing Integration', () => {
  let queryClient: QueryClient;
  const mockOrchardId = 'test-orchard-id';

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries for testing
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };

  describe('useOrchardTrees hook', () => {
    it('should fetch trees without filters', async () => {
      const mockResponse = {
        trees: [
          {
            id: '1',
            orchardId: mockOrchardId,
            code: 'T001',
            zone: 'A',
            type: 'ทุเรียน',
            variety: 'หมอนทอง',
            plantedDate: '2024-01-01',
            status: 'healthy',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: '2',
            orchardId: mockOrchardId,
            code: 'T002',
            zone: 'B',
            type: 'ทุเรียน',
            variety: 'ก้านยาว',
            plantedDate: '2024-01-02',
            status: 'sick',
            createdAt: '2024-01-02T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      vi.mocked(getOrchardTreesServer).mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useOrchardTrees(mockOrchardId),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(getOrchardTreesServer).toHaveBeenCalledWith(mockOrchardId, 1, 20, {});
      expect(result.current.data?.trees).toHaveLength(2);
      expect(result.current.data?.trees[0].status).toBe('healthy');
      expect(result.current.data?.trees[1].status).toBe('sick');
    });

    it('should fetch trees with status filter (lowercase from UI)', async () => {
      const mockResponse = {
        trees: [
          {
            id: '1',
            orchardId: mockOrchardId,
            code: 'T001',
            zone: 'A',
            type: 'ทุเรียน',
            variety: 'หมอนทอง',
            plantedDate: '2024-01-01',
            status: 'healthy',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      vi.mocked(getOrchardTreesServer).mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useOrchardTrees(mockOrchardId, {
          filters: { status: 'healthy' }, // UI sends lowercase
        }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should convert to uppercase before calling server action
      expect(getOrchardTreesServer).toHaveBeenCalledWith(
        mockOrchardId,
        1,
        20,
        {
          status: 'HEALTHY', // Should be uppercase
        }
      );

      expect(result.current.data?.trees).toHaveLength(1);
      expect(result.current.data?.trees[0].status).toBe('healthy');
    });

    it('should fetch trees with zone filter', async () => {
      const mockResponse = {
        trees: [
          {
            id: '1',
            orchardId: mockOrchardId,
            code: 'T001',
            zone: 'A',
            type: 'ทุเรียน',
            variety: 'หมอนทอง',
            plantedDate: '2024-01-01',
            status: 'healthy',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      vi.mocked(getOrchardTreesServer).mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useOrchardTrees(mockOrchardId, {
          filters: { zone: 'A' },
        }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(getOrchardTreesServer).toHaveBeenCalledWith(
        mockOrchardId,
        1,
        20,
        {
          zone: 'A',
        }
      );

      expect(result.current.data?.trees).toHaveLength(1);
      expect(result.current.data?.trees[0].zone).toBe('A');
    });

    it('should fetch trees with search term', async () => {
      const mockResponse = {
        trees: [
          {
            id: '1',
            orchardId: mockOrchardId,
            code: 'SEARCH001',
            zone: 'A',
            type: 'ทุเรียน',
            variety: 'หมอนทอง',
            plantedDate: '2024-01-01',
            status: 'healthy',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      vi.mocked(getOrchardTreesServer).mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useOrchardTrees(mockOrchardId, {
          filters: { searchTerm: 'SEARCH' },
        }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(getOrchardTreesServer).toHaveBeenCalledWith(
        mockOrchardId,
        1,
        20,
        {
          searchTerm: 'SEARCH',
        }
      );

      expect(result.current.data?.trees).toHaveLength(1);
      expect(result.current.data?.trees[0].code).toBe('SEARCH001');
    });

    it('should fetch trees with combined filters', async () => {
      const mockResponse = {
        trees: [
          {
            id: '1',
            orchardId: mockOrchardId,
            code: 'SICK001',
            zone: 'B',
            type: 'ทุเรียน',
            variety: 'หมอนทอง',
            plantedDate: '2024-01-01',
            status: 'sick',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      vi.mocked(getOrchardTreesServer).mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () =>
          useOrchardTrees(mockOrchardId, {
            filters: {
              status: 'sick', // Lowercase from UI
              zone: 'B',
              searchTerm: 'SICK',
            },
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(getOrchardTreesServer).toHaveBeenCalledWith(
        mockOrchardId,
        1,
        20,
        {
          status: 'SICK', // Should be uppercase
          zone: 'B',
          searchTerm: 'SICK',
        }
      );

      expect(result.current.data?.trees).toHaveLength(1);
      expect(result.current.data?.trees[0].status).toBe('sick');
    });

    it('should handle pagination correctly', async () => {
      const mockResponse = {
        trees: [],
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: true,
        },
      };

      vi.mocked(getOrchardTreesServer).mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () =>
          useOrchardTrees(mockOrchardId, {
            page: 2,
            limit: 10,
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(getOrchardTreesServer).toHaveBeenCalledWith(
        mockOrchardId,
        2,
        10,
        {}
      );

      expect(result.current.data?.pagination.page).toBe(2);
      expect(result.current.data?.pagination.total).toBe(25);
      expect(result.current.data?.pagination.hasNext).toBe(true);
      expect(result.current.data?.pagination.hasPrev).toBe(true);
    });

    it('should handle empty results', async () => {
      const mockResponse = {
        trees: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };

      vi.mocked(getOrchardTreesServer).mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useOrchardTrees(mockOrchardId),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.trees).toHaveLength(0);
      expect(result.current.data?.pagination.total).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Failed to fetch trees');
      vi.mocked(getOrchardTreesServer).mockRejectedValue(mockError);

      const { result } = renderHook(
        () => useOrchardTrees(mockOrchardId),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.data?.trees).toBeUndefined();
    });
  });
});