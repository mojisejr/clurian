import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import DashboardPage from '@/app/dashboard/page';
import { createMockOrchardProvider } from '@/test-utils/mock-providers';
import { vi, beforeAll, afterEach, describe, it, expect } from 'vitest';
import { useOrchardTrees, useOrchardActivityLogs } from '@/lib/hooks/use-orchard-queries';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
  }),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: () => '/dashboard',
}));

// Mock UUID generation
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-123',
}));

// Mock hooks
vi.mock('@/lib/hooks/use-orchard-queries', () => ({
  useOrchardTrees: vi.fn(() => ({
    data: { trees: [
      {
        id: 'tree-1',
        code: 'T001',
        zone: 'A',
        type: 'ทุเรียน',
        variety: 'หมอนทอง',
        status: 'healthy',
        plantedDate: '2024-01-01',
        createdAt: '2024-01-01T00:00:00.000Z',
        orchardId: 'orchard-1',
      },
      {
        id: 'tree-2',
        code: 'T002',
        zone: 'B',
        type: 'ทุเรียน',
        variety: 'ชันสกุล',
        status: 'sick',
        plantedDate: '2024-01-02',
        createdAt: '2024-01-02T00:00:00.000Z',
        orchardId: 'orchard-1',
      },
    ] },
    isLoading: false,
  })),
  useOrchardActivityLogs: vi.fn(() => ({
    data: { logs: [] },
    isLoading: false,
    refetch: vi.fn(),
  })),
  useSpecificCacheInvalidation: vi.fn(() => ({
    invalidateSpecificTrees: vi.fn(),
  })),
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

const mockTrees = [
  {
    id: 'tree-1',
    code: 'T001',
    zone: 'A',
    type: 'ทุเรียน',
    variety: 'หมอนทอง',
    status: 'healthy' as const,
    plantedDate: '2024-01-01',
    createdAt: '2024-01-01T00:00:00.000Z',
    orchardId: 'orchard-1',
  },
  {
    id: 'tree-2',
    code: 'T002',
    zone: 'B',
    type: 'ทุเรียน',
    variety: 'ชันสกุล',
    status: 'sick' as const,
    plantedDate: '2024-01-02',
    createdAt: '2024-01-02T00:00:00.000Z',
    orchardId: 'orchard-1',
  },
];

const mockCurrentOrchard = {
  id: 'orchard-1',
  name: 'สวนทุเรียนทดสอบ',
  zones: ['A', 'B'],
  ownerId: 'user-1',
  createdAt: '2024-01-01T00:00:00.000Z',
};

describe('DashboardPage Deep Linking', () => {
  let queryClient: QueryClient;
  let MockProvider: React.ComponentType<{ children: React.ReactNode }>;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    MockProvider = createMockOrchardProvider({
      trees: mockTrees,
      currentOrchard: mockCurrentOrchard,
      isLoadingTrees: false,
      isLoadingOrchards: false,
    });

    // Clear all mocks
    vi.clearAllMocks();

    // Reset default mocks
    vi.mocked(useOrchardTrees).mockReturnValue({
      data: { trees: mockTrees },
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams());
  });

  describe('TreeId Parameter Handling', () => {
    it('should extract treeId from search params', async () => {
      const MockedSearchParams = () => {
        const searchParams = new URLSearchParams('?treeId=tree-1');
        vi.mocked(useSearchParams).mockReturnValue(searchParams);

        return (
          <QueryClientProvider client={queryClient}>
            <MockProvider>
              <DashboardPage searchParams={{ treeId: 'tree-1' }} />
            </MockProvider>
          </QueryClientProvider>
        );
      };

      render(<MockedSearchParams />);

      // Should show loading state initially
      await waitFor(() => {
        expect(screen.getByText(/กำลังโหลดข้อมูลต้นไม้.../i)).toBeInTheDocument();
      });
    });

    it('should show loading state when treeId exists but trees not loaded', async () => {
      const MockProviderWithLoading = createMockOrchardProvider({
        trees: [],
        currentOrchard: mockCurrentOrchard,
        isLoadingTrees: true,
        isLoadingOrchards: false,
      });

      const MockedComponent = () => (
        <QueryClientProvider client={queryClient}>
          <MockProviderWithLoading>
            <DashboardPage searchParams={{ treeId: 'tree-1' }} />
          </MockProviderWithLoading>
        </QueryClientProvider>
      );

      render(<MockedComponent />);

      await waitFor(() => {
        expect(screen.getByText(/กำลังโหลด.../i)).toBeInTheDocument();
      });
    });

    it('should show TreeDetailView when treeId matches in trees', async () => {
      const MockProviderWithData = createMockOrchardProvider({
        trees: mockTrees,
        currentOrchard: mockCurrentOrchard,
        isLoadingTrees: false,
        isLoadingOrchards: false,
      });

      const MockedComponent = () => (
        <QueryClientProvider client={queryClient}>
          <MockProviderWithData>
            <DashboardPage searchParams={{ treeId: 'tree-1' }} />
          </MockProviderWithData>
        </QueryClientProvider>
      );

      render(<MockedComponent />);

      await waitFor(() => {
        expect(screen.getByText(/T001/i)).toBeInTheDocument();
        expect(screen.getByText(/กลับหน้าหลัก/i)).toBeInTheDocument();
      });
    });

    it('should show error when treeId not found in trees', async () => {
      const MockProviderWithData = createMockOrchardProvider({
        trees: mockTrees,
        currentOrchard: mockCurrentOrchard,
        isLoadingTrees: false,
        isLoadingOrchards: false,
      });

      const MockedComponent = () => (
        <QueryClientProvider client={queryClient}>
          <MockProviderWithData>
            <DashboardPage searchParams={{ treeId: 'non-existent-tree' }} />
          </MockProviderWithData>
        </QueryClientProvider>
      );

      render(<MockedComponent />);

      await waitFor(() => {
        expect(screen.getByText(/ไม่พบข้อมูลต้นไม้/i)).toBeInTheDocument();
        expect(screen.getByText(/กลับหน้าหลัก/i)).toBeInTheDocument();
      });
    });

    it('should return to dashboard when treeId is removed', async () => {
      const MockProviderWithData = createMockOrchardProvider({
        trees: mockTrees,
        currentOrchard: mockCurrentOrchard,
        isLoadingTrees: false,
        isLoadingOrchards: false,
      });

      // Start with treeId
      const searchParams = new URLSearchParams();
      searchParams.set('treeId', 'tree-1');
      vi.mocked(useSearchParams).mockReturnValue(searchParams);

      // First render with treeId
      const { rerender } = render(
        <QueryClientProvider client={queryClient}>
          <MockProviderWithData>
            <DashboardPage searchParams={{ treeId: 'tree-1' }} />
          </MockProviderWithData>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/T001/i)).toBeInTheDocument();
      });

      // Then render without treeId
      rerender(
        <QueryClientProvider client={queryClient}>
          <MockProviderWithData>
            <DashboardPage searchParams={{}} />
          </MockProviderWithData>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /T001/i })).not.toBeInTheDocument();
        expect(screen.getByText(/ต้นไม้/i)).toBeInTheDocument(); // Dashboard view
      });
    });
  });

  describe('Loading and Error States', () => {
    it('should handle empty trees array gracefully', async () => {
      const searchParams = new URLSearchParams();
      searchParams.set('treeId', 'tree-1');
      vi.mocked(useSearchParams).mockReturnValue(searchParams);

      // Mock empty trees
      vi.mocked(useOrchardTrees).mockReturnValue({
        data: { trees: [] },
        isLoading: false,
        refetch: vi.fn(),
      } as any);

      const MockProviderEmpty = createMockOrchardProvider({
        trees: [],
        currentOrchard: mockCurrentOrchard,
        isLoadingTrees: false,
        isLoadingOrchards: false,
      });

      const MockedComponent = () => (
        <QueryClientProvider client={queryClient}>
          <MockProviderEmpty>
            <DashboardPage searchParams={{ treeId: 'tree-1' }} />
          </MockProviderEmpty>
        </QueryClientProvider>
      );

      render(<MockedComponent />);

      await waitFor(() => {
        expect(screen.getByText(/ไม่พบข้อมูลต้นไม้/i)).toBeInTheDocument();
      });
    });

    it('should handle orchard not found', async () => {
      const MockProviderNoOrchard = createMockOrchardProvider({
        trees: [],
        currentOrchard: null,
        isLoadingTrees: false,
        isLoadingOrchards: false,
      });

      const MockedComponent = () => (
        <QueryClientProvider client={queryClient}>
          <MockProviderNoOrchard>
            <DashboardPage searchParams={{ treeId: 'tree-1' }} />
          </MockProviderNoOrchard>
        </QueryClientProvider>
      );

      render(<MockedComponent />);

      await waitFor(() => {
        expect(screen.getByText(/สร้างสวนแรกของคุณ/i)).toBeInTheDocument();
      });
    });
  });

  describe('URL Parameter Edge Cases', () => {
    it('should handle invalid treeId format', async () => {
      const MockProviderWithData = createMockOrchardProvider({
        trees: mockTrees,
        currentOrchard: mockCurrentOrchard,
        isLoadingTrees: false,
        isLoadingOrchards: false,
      });

      const MockedComponent = () => (
        <QueryClientProvider client={queryClient}>
          <MockProviderWithData>
            <DashboardPage searchParams={{ treeId: 'invalid-format' }} />
          </MockProviderWithData>
        </QueryClientProvider>
      );

      render(<MockedComponent />);

      await waitFor(() => {
        expect(screen.getByText(/ไม่พบข้อมูลต้นไม้/i)).toBeInTheDocument();
      });
    });

    it('should handle empty treeId string', async () => {
      const MockProviderWithData = createMockOrchardProvider({
        trees: mockTrees,
        currentOrchard: mockCurrentOrchard,
        isLoadingTrees: false,
        isLoadingOrchards: false,
      });

      const MockedComponent = () => (
        <QueryClientProvider client={queryClient}>
          <MockProviderWithData>
            <DashboardPage searchParams={{ treeId: '' }} />
          </MockProviderWithData>
        </QueryClientProvider>
      );

      render(<MockedComponent />);

      await waitFor(() => {
        expect(screen.getByText(/ต้นไม้/i)).toBeInTheDocument(); // Should show dashboard
      });
    });
  });
});