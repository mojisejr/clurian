/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTreeHistory } from '@/hooks/useTreeHistory';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
  }),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: () => '/dashboard',
}));

// Mock Orchard provider
vi.mock('@/components/providers/orchard-provider', () => ({
  useOrchard: vi.fn(() => ({
    currentOrchardId: 'orchard-1',
    currentOrchard: {
      id: 'orchard-1',
      name: 'สวนทุเรียนทดสอบ',
      zones: ['A', 'B'],
    },
    isLoadingOrchards: false,
    isFetchingOrchardData: false,
    batchActivityCount: 0,
    scheduledActivityCount: 0,
    filterZone: 'ALL',
    filterStatus: 'ALL',
    searchTerm: '',
    currentPage: 1,
  })),
}));

// Mock hooks
vi.mock('@/lib/hooks/use-orchard-queries', () => ({
  useOrchardActivityLogs: vi.fn(() => ({ data: { logs: [] }, isLoading: false })),
  useOrchardTrees: vi.fn(() => ({ 
    data: { 
      trees: [
        {
          id: 'tree-1',
          code: 'T001',
          zone: 'A',
          type: 'ทุเรียน',
          variety: 'หมอนทอง',
          status: 'healthy',
          plantedDate: '2024-01-01',
          orchardId: 'orchard-1',
        }
      ] 
    }, 
    isLoading: false 
  })),
  useInvalidateOrchardData: vi.fn(() => ({
    invalidateActivityLogs: vi.fn(),
  })),
  useSpecificCacheInvalidation: vi.fn(() => ({
    invalidateSpecificTrees: vi.fn(),
  })),
}));

// Mock useTreeHistory with proper implementation
vi.mock('@/hooks/useTreeHistory', () => ({
  useTreeHistory: vi.fn(() => ({
    logs: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
}));

vi.mock('@/hooks/useMixingFormulas', () => ({
  useMixingFormulas: vi.fn(() => ({
    mixingFormulas: [],
    isLoading: false,
  })),
}));

// Test data
const mockTree = {
  id: 'tree-1',
  code: 'T001',
  zone: 'A',
  type: 'ทุเรียน',
  variety: 'หมอนทอง',
  status: 'healthy' as const,
  plantedDate: '2024-01-01',
  orchardId: 'orchard-1',
};

const mockActivityLogs = [
  {
    id: 'log-1',
    orchardId: 'orchard-1',
    logType: 'INDIVIDUAL' as const,
    treeId: 'tree-1',
    action: 'ให้ปุ๋ย',
    note: 'ใช้ปุ๋ย NPK 15-15-15',
    performDate: '2024-01-15',
    status: 'COMPLETED' as const,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'log-2',
    orchardId: 'orchard-1',
    logType: 'BATCH' as const,
    targetZone: 'A',
    action: 'ฉีดยาฆ่าแมลง',
    note: 'ฉีดพื้นที่โซน A ทั้งหมด',
    performDate: '2024-01-10',
    status: 'COMPLETED' as const,
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'log-3',
    orchardId: 'orchard-1',
    logType: 'INDIVIDUAL' as const,
    treeId: 'tree-1',
    action: 'รักษาโรคใบจุด',
    note: 'พบโรคใบจุด ต้องติดตามอาการ',
    performDate: '2024-01-20',
    status: 'IN_PROGRESS' as const,
    followUpDate: '2024-01-27',
    createdAt: '2024-01-20T14:00:00Z',
  },
];

describe('Tree History Deep Linking Tests', () => {
  let queryClient: QueryClient;
  let mockUseTreeHistory: any;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();

    // Get the mocked hook
    mockUseTreeHistory = vi.mocked(useTreeHistory);
  });

  describe('Phase 1: Loading States', () => {
    it('should show loading state when TreeHistorySection is loading logs', async () => {
      // Mock loading state
      mockUseTreeHistory.mockReturnValue({
        logs: [],
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      });

      const TreeHistorySection = (await import('@/components/dashboard/detail/tree-history-section')).TreeHistorySection;

      render(
        <QueryClientProvider client={queryClient}>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </QueryClientProvider>
      );

      // Check for loading indicator
      await waitFor(() => {
        const loadingIndicator = document.querySelector('.animate-spin');
        expect(loadingIndicator).toBeInTheDocument();
      });
    });

    it('should show error state when TreeHistorySection fails to load logs', async () => {
      // Mock error state
      mockUseTreeHistory.mockReturnValue({
        logs: [],
        isLoading: false,
        error: new Error('Failed to load logs'),
        refetch: vi.fn(),
      });

      const TreeHistorySection = (await import('@/components/dashboard/detail/tree-history-section')).TreeHistorySection;

      render(
        <QueryClientProvider client={queryClient}>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </QueryClientProvider>
      );

      // Check for error message
      await waitFor(() => {
        const errorMessage = screen.queryByText(/เกิดข้อผิดพลาด/i);
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('should not show loading when logs are already loaded', async () => {
      // Mock successful load
      mockUseTreeHistory.mockReturnValue({
        logs: mockActivityLogs,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const TreeHistorySection = (await import('@/components/dashboard/detail/tree-history-section')).TreeHistorySection;

      render(
        <QueryClientProvider client={queryClient}>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
      });
    });
  });

  describe('Phase 2: Individual Logs Display', () => {
    it('should display individual logs for the specific tree', async () => {
      mockUseTreeHistory.mockReturnValue({
        logs: mockActivityLogs,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const TreeHistorySection = (await import('@/components/dashboard/detail/tree-history-section')).TreeHistorySection;

      render(
        <QueryClientProvider client={queryClient}>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        // Should show individual logs for tree-1
        expect(screen.getByText('ให้ปุ๋ย')).toBeInTheDocument();
        expect(screen.getByText('รักษาโรคใบจุด')).toBeInTheDocument();
        // Should show batch logs for zone A
        expect(screen.getByText('ฉีดยาฆ่าแมลง')).toBeInTheDocument();
      });
    });

    it('should not show individual logs from other trees', async () => {
      const otherTreeLogs = [
        ...mockActivityLogs,
        {
          id: 'log-4',
          orchardId: 'orchard-1',
          logType: 'INDIVIDUAL' as const,
          treeId: 'tree-2', // Different tree
          action: 'ให้น้ำ',
          note: 'ให้น้ำต้นทุเรียนต้นอื่น',
          performDate: '2024-01-25',
          status: 'COMPLETED' as const,
          createdAt: '2024-01-25T10:00:00Z',
        },
      ];

      mockUseTreeHistory.mockReturnValue({
        logs: otherTreeLogs,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const TreeHistorySection = (await import('@/components/dashboard/detail/tree-history-section')).TreeHistorySection;

      render(
        <QueryClientProvider client={queryClient}>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        // Should show logs for tree-1
        expect(screen.getByText('ให้ปุ๋ย')).toBeInTheDocument();
        // Should NOT show logs for tree-2
        expect(screen.queryByText('ให้น้ำ')).not.toBeInTheDocument();
      });
    });
  });

  describe('Phase 3: Batch Logs Display', () => {
    it('should display batch logs for the tree zone', async () => {
      mockUseTreeHistory.mockReturnValue({
        logs: mockActivityLogs,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const TreeHistorySection = (await import('@/components/dashboard/detail/tree-history-section')).TreeHistorySection;

      render(
        <QueryClientProvider client={queryClient}>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        // Should show batch logs for zone A
        expect(screen.getByText('ฉีดยาฆ่าแมลง')).toBeInTheDocument();
        expect(screen.getByText('ฉีดพื้นที่โซน A ทั้งหมด')).toBeInTheDocument();
      });
    });

    it('should not show batch logs from other zones', async () => {
      const otherZoneLogs = [
        ...mockActivityLogs,
        {
          id: 'log-5',
          orchardId: 'orchard-1',
          logType: 'BATCH' as const,
          targetZone: 'B', // Different zone
          action: 'ให้ปุ๋ยโซน B',
          note: 'ให้ปุ๋ยพื้นที่โซน B',
          performDate: '2024-01-26',
          status: 'COMPLETED' as const,
          createdAt: '2024-01-26T08:00:00Z',
        },
      ];

      mockUseTreeHistory.mockReturnValue({
        logs: otherZoneLogs,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const TreeHistorySection = (await import('@/components/dashboard/detail/tree-history-section')).TreeHistorySection;

      render(
        <QueryClientProvider client={queryClient}>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        // Should show batch logs for zone A
        expect(screen.getByText('ฉีดยาฆ่าแมลง')).toBeInTheDocument();
        // Should NOT show batch logs for zone B
        expect(screen.queryByText('ให้ปุ๋ยโซน B')).not.toBeInTheDocument();
      });
    });
  });

  describe('Phase 4: Tab Filtering', () => {
    it('should filter to show only individual logs when "ทั้งหมด" tab is selected', async () => {
      mockUseTreeHistory.mockReturnValue({
        logs: mockActivityLogs,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const TreeHistorySection = (await import('@/components/dashboard/detail/tree-history-section')).TreeHistorySection;

      render(
        <QueryClientProvider client={queryClient}>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        // Default tab "ทั้งหมด" should show all relevant logs
        expect(screen.getByText('ให้ปุ๋ย')).toBeInTheDocument();
        expect(screen.getByText('ฉีดยาฆ่าแมลง')).toBeInTheDocument();
        expect(screen.getByText('รักษาโรคใบจุด')).toBeInTheDocument();
      });
    });

    it('should filter to show only batch logs when "งานเหมา" tab is selected', async () => {
      mockUseTreeHistory.mockReturnValue({
        logs: mockActivityLogs,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const TreeHistorySection = (await import('@/components/dashboard/detail/tree-history-section')).TreeHistorySection;

      render(
        <QueryClientProvider client={queryClient}>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        // Click on "งานเหมา" tab
        const batchTab = screen.getByText(/งานเหมา/);
        userEvent.click(batchTab);
      });

      await waitFor(() => {
        // Should only show batch logs
        expect(screen.getByText('ฉีดยาฆ่าแมลง')).toBeInTheDocument();
        // Should not show individual logs
        expect(screen.queryByText('ให้ปุ๋ย')).not.toBeInTheDocument();
        expect(screen.queryByText('รักษาโรคใบจุด')).not.toBeInTheDocument();
      });
    });

    it('should filter to show only follow-up logs when "ติดตาม/นัดหมาย" tab is selected', async () => {
      mockUseTreeHistory.mockReturnValue({
        logs: mockActivityLogs,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const TreeHistorySection = (await import('@/components/dashboard/detail/tree-history-section')).TreeHistorySection;

      render(
        <QueryClientProvider client={queryClient}>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        // Click on "ติดตาม/นัดหมาย" tab
        const followupTab = screen.getByText(/ติดตาม\/นัดหมาย/);
        userEvent.click(followupTab);
      });

      await waitFor(() => {
        // Should only show IN_PROGRESS logs
        expect(screen.getByText('รักษาโรคใบจุด')).toBeInTheDocument();
        // Should not show COMPLETED logs
        expect(screen.queryByText('ให้ปุ๋ย')).not.toBeInTheDocument();
        expect(screen.queryByText('ฉีดยาฆ่าแมลง')).not.toBeInTheDocument();
      });
    });
  });

  describe('Phase 5: Cache Invalidation', () => {
    it('should call refetch when tree changes', async () => {
      const refetchMock = vi.fn();

      mockUseTreeHistory.mockReturnValue({
        logs: mockActivityLogs,
        isLoading: false,
        error: null,
        refetch: refetchMock,
      });

      const TreeHistorySection = (await import('@/components/dashboard/detail/tree-history-section')).TreeHistorySection;

      const { rerender } = render(
        <QueryClientProvider client={queryClient}>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('ประวัติการดูแล')).toBeInTheDocument();
      });

      // Rerender with different tree
      const differentTree = { ...mockTree, id: 'tree-2', code: 'T002' };

      rerender(
        <QueryClientProvider client={queryClient}>
          <TreeHistorySection tree={differentTree} onLogClick={vi.fn()} />
        </QueryClientProvider>
      );

      // Should refetch data for new tree
      await waitFor(() => {
        expect(mockUseTreeHistory).toHaveBeenCalledWith(expect.objectContaining({
          tree: expect.objectContaining({ id: 'tree-2' })
        }));
      });
    });
  });

  describe('Phase 6: Search and Sort', () => {
    it('should filter logs based on search term', async () => {
      mockUseTreeHistory.mockReturnValue({
        logs: mockActivityLogs,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const TreeHistorySection = (await import('@/components/dashboard/detail/tree-history-section')).TreeHistorySection;

      render(
        <QueryClientProvider client={queryClient}>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        // Type in search box
        const searchInput = screen.getByPlaceholderText('ค้นหากิจกรรม...');
        userEvent.type(searchInput, 'ปุ๋ย');
      });

      await waitFor(() => {
        // Should show only logs containing "ปุ๋ย"
        expect(screen.getByText('ให้ปุ๋ย')).toBeInTheDocument();
        // Should not show logs without "ปุ๋ย"
        expect(screen.queryByText('ฉีดยาฆ่าแมลง')).not.toBeInTheDocument();
        expect(screen.queryByText('รักษาโรคใบจุด')).not.toBeInTheDocument();
      });
    });

    it('should sort logs by date', async () => {
      mockUseTreeHistory.mockReturnValue({
        logs: mockActivityLogs,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const TreeHistorySection = (await import('@/components/dashboard/detail/tree-history-section')).TreeHistorySection;

      render(
        <QueryClientProvider client={queryClient}>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        // Default sort is "ใหม่-เก่ว" (desc)
        // We select the log items by their container class 'group' which is used for hover effects
        const logs = document.querySelectorAll('.group');
        
        // The most recent log should be first
        expect(logs[0]).toHaveTextContent('รักษาโรคใบจุด'); // 2024-01-20
      });

      // Change sort to "เก่า-ใหม่" (asc)
      const sortButton = screen.getByText('ใหม่-เก่า');
      userEvent.click(sortButton);

      await waitFor(() => {
        expect(screen.getByText('เก่า-ใหม่')).toBeInTheDocument();
      });
    });
  });

  describe('Phase 7: Deep Linking Integration', () => {
    it('should work correctly when accessed via deep link with treeId', async () => {
      mockUseTreeHistory.mockReturnValue({
        logs: mockActivityLogs,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const { useSearchParams } = await import('next/navigation');
      const mockUseSearchParams = vi.mocked(useSearchParams);
      mockUseSearchParams.mockReturnValue(new URLSearchParams('treeId=tree-1'));

      const DashboardPage = (await import('@/app/dashboard/page')).default;

      render(
        <QueryClientProvider client={queryClient}>
          <DashboardPage searchParams={{ treeId: 'tree-1' }} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        // Should show tree detail with history
        expect(screen.getByText('ประวัติการดูแล')).toBeInTheDocument();
        expect(screen.getByText('ให้ปุ๋ย')).toBeInTheDocument();
      });
    });

    it('should handle race condition when orchard data is not ready', async () => {
      // Mock orchard provider with no orchard initially
      const { useOrchard } = await import('@/components/providers/orchard-provider');
      const mockUseOrchard = vi.mocked(useOrchard);

      mockUseOrchard.mockReturnValue({
        currentOrchardId: null,
        currentOrchard: null,
        isLoadingOrchards: true,
        isFetchingOrchardData: false,
        batchActivityCount: 0,
        scheduledActivityCount: 0,
        filterZone: 'ALL',
        filterStatus: 'ALL',
        searchTerm: '',
        currentPage: 1,
      });

      mockUseTreeHistory.mockReturnValue({
        logs: [],
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      });

      const TreeHistorySection = (await import('@/components/dashboard/detail/tree-history-section')).TreeHistorySection;

      render(
        <QueryClientProvider client={queryClient}>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        // Should show loading state or handle gracefully
        const loadingIndicator = document.querySelector('.animate-spin');
        expect(loadingIndicator).toBeInTheDocument();
      });
    });
  });

  describe('Phase 8: Performance Optimization', () => {
    it('should not make duplicate API calls', async () => {
      const refetchMock = vi.fn();

      mockUseTreeHistory.mockReturnValue({
        logs: mockActivityLogs,
        isLoading: false,
        error: null,
        refetch: refetchMock,
      });

      const TreeHistorySection = (await import('@/components/dashboard/detail/tree-history-section')).TreeHistorySection;

      render(
        <QueryClientProvider client={queryClient}>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('ประวัติการดูแล')).toBeInTheDocument();
      });

      // Should not call refetch unnecessarily
      expect(refetchMock).not.toHaveBeenCalled();
    });

    it('should cache logs data properly', async () => {
      mockUseTreeHistory.mockReturnValue({
        logs: mockActivityLogs,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const TreeHistorySection = (await import('@/components/dashboard/detail/tree-history-section')).TreeHistorySection;

      const { rerender } = render(
        <QueryClientProvider client={queryClient}>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('ประวัติการดูแล')).toBeInTheDocument();
      });

      // Rerender same component
      rerender(
        <QueryClientProvider client={queryClient}>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        // Should still show data without additional loading
        expect(screen.getByText('ให้ปุ๋ย')).toBeInTheDocument();
      });
    });
  });
});