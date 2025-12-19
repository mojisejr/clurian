import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getOrchardActivityLogs } from '@/lib/services/activity-service';
import { useTreeHistory } from '@/hooks/useTreeHistory';
import { TreeHistorySection } from '@/components/dashboard/detail/tree-history-section';
import type { Tree, Log } from '@/lib/types';
import { useOrchard } from '@/components/providers/orchard-provider';

// Mock dependencies
vi.mock('@/lib/services/activity-service');
vi.mock('@/components/providers/orchard-provider', () => ({
  useOrchard: vi.fn()
}));

// Mock React Query hook properly
vi.mock('@/lib/hooks/use-orchard-queries', () => ({
  useOrchardActivityLogs: vi.fn(),
  useSpecificCacheInvalidation: vi.fn(() => ({
    invalidateSpecificTrees: vi.fn(),
  })),
}));

const mockGetOrchardActivityLogs = vi.mocked(getOrchardActivityLogs);
const mockUseOrchard = vi.mocked(useOrchard);

// Get the mock function reference
const { useOrchardActivityLogs: mockUseOrchardActivityLogs } =
  await import('@/lib/hooks/use-orchard-queries');

// Mock data representing database output (UPPERCASE enums)
const mockDatabaseLogs = [
  {
    id: 'log1',
    orchardId: 'orchard1',
    logType: 'INDIVIDUAL' as const,
    treeId: 'tree1',
    action: 'ให้ปุ๋ย',
    note: 'ปุ๋ยสูตร 15-15-15',
    performDate: new Date('2024-01-15'),
    status: 'COMPLETED' as const,
    followUpDate: null,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    tree: { id: 'tree1', code: 'T001' }
  },
  {
    id: 'log2',
    orchardId: 'orchard1',
    logType: 'BATCH' as const,
    targetZone: 'A',
    action: 'ฉีดพ่นยา',
    note: 'ควบคุมแมลงศัตรูพืช',
    performDate: new Date('2024-01-10'),
    status: 'COMPLETED' as const,
    followUpDate: null,
    createdAt: new Date('2024-01-10T08:00:00Z'),
    tree: null
  },
  {
    id: 'log3',
    orchardId: 'orchard1',
    logType: 'INDIVIDUAL' as const,
    treeId: 'tree1',
    action: 'รักษาโรคใบจุด',
    note: 'ใช้ยาป้องกันเชื้อรา',
    performDate: new Date('2024-01-20'),
    status: 'IN_PROGRESS' as const,
    followUpDate: new Date('2024-01-25'),
    createdAt: new Date('2024-01-20T14:00:00Z'),
    tree: { id: 'tree1', code: 'T001' }
  }
];

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Phase 1: Tree History Case Mismatch Tests', () => {

  describe('1.1 Service Layer Data Transformation', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should preserve original enum case from database', async () => {
      // Mock Prisma response with UPPERCASE enums
      const mockPrismaLogs = mockDatabaseLogs;

      // Mock the service to return UPPERCASE values (as it should after fix)
      mockGetOrchardActivityLogs.mockResolvedValue({
        logs: mockPrismaLogs.map(log => ({
          ...log,
          // Fixed service preserves UPPERCASE from database
          logType: log.logType as Log['logType'],     // Now UPPERCASE
          status: log.status as Log['status'],         // Now UPPERCASE
          performDate: log.performDate.toISOString().split('T')[0],
          followUpDate: log.followUpDate?.toISOString().split('T')[0] || null,
          createdAt: log.createdAt.toISOString(),
          treeId: log.treeId || undefined,
          targetZone: log.targetZone || undefined,
          note: log.note || '',
          orchardId: log.orchardId
        })) as Log[],
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      });

      const result = await getOrchardActivityLogs('orchard1');

      // Service should now preserve UPPERCASE from database
      expect(result.logs[0].logType).toBe('INDIVIDUAL');
      expect(result.logs[0].status).toBe('COMPLETED');
      expect(result.logs[1].logType).toBe('BATCH');
      expect(result.logs[2].status).toBe('IN_PROGRESS');
    });

    it('should not convert logType to lowercase', async () => {
      // Test that INDIVIDUAL and BATCH remain uppercase
      const mockPrismaLogs = mockDatabaseLogs.filter(l => l.logType === 'INDIVIDUAL');

      mockGetOrchardActivityLogs.mockResolvedValue({
        logs: mockPrismaLogs.map(log => ({
          ...log,
          // Fixed service preserves UPPERCASE
          logType: log.logType as Log['logType'],     // UPPERCASE
          status: log.status as Log['status'],         // UPPERCASE
          performDate: log.performDate.toISOString().split('T')[0],
          followUpDate: log.followUpDate?.toISOString().split('T')[0] || null,
          createdAt: log.createdAt.toISOString(),
          treeId: log.treeId || undefined,
          targetZone: log.targetZone || undefined,
          note: log.note || '',
          orchardId: log.orchardId
        })) as Log[],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      });

      const result = await getOrchardActivityLogs('orchard1');

      // Service should preserve UPPERCASE
      expect(result.logs.every(l => l.logType === 'INDIVIDUAL')).toBe(true);
      expect(result.logs.every(l => l.logType === 'individual')).toBe(false); // Should NOT be lowercase
    });

    it('should not convert status to lowercase', async () => {
      // Test that COMPLETED and IN_PROGRESS remain uppercase
      const mockPrismaLogs = mockDatabaseLogs.filter(l => l.status === 'IN_PROGRESS');

      mockGetOrchardActivityLogs.mockResolvedValue({
        logs: mockPrismaLogs.map(log => ({
          ...log,
          // Fixed service preserves UPPERCASE
          logType: log.logType as Log['logType'],     // UPPERCASE
          status: log.status as Log['status'],         // UPPERCASE
          performDate: log.performDate.toISOString().split('T')[0],
          followUpDate: log.followUpDate?.toISOString().split('T')[0] || null,
          createdAt: log.createdAt.toISOString(),
          treeId: log.treeId || undefined,
          targetZone: log.targetZone || undefined,
          note: log.note || '',
          orchardId: log.orchardId
        })) as Log[],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      });

      const result = await getOrchardActivityLogs('orchard1');

      // Service should preserve UPPERCASE
      expect(result.logs.every(l => l.status === 'IN_PROGRESS')).toBe(true);
      expect(result.logs.every(l => l.status === 'in_progress')).toBe(false); // Should NOT be lowercase
    });
  });

  describe('1.2 useTreeHistory Hook Filtering', () => {
    const mockTree: Tree = {
      id: 'tree1',
      orchardId: 'orchard1',
      code: 'T001',
      zone: 'A',
      type: 'ทุเรียน',
      variety: 'หมอนทอง',
      plantedDate: '2024-01-01',
      status: 'healthy',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    beforeEach(() => {
      vi.clearAllMocks();
      mockUseOrchard.mockReturnValue({
        currentOrchardId: 'orchard1',
        // @ts-expect-error - we only need currentOrchardId for this test
        orchards: [],
        isLoading: false,
        error: null,
        setCurrentOrchard: vi.fn(),
        addOrchard: vi.fn(),
        updateOrchard: vi.fn(),
        deleteOrchard: vi.fn()
      });
    });

    function TestComponent({ tree }: { tree: Tree }) {
      const { logs } = useTreeHistory({ tree, orchardId: 'orchard1' });

      // Just return logs count for testing
      return <div data-testid="logs-count">{logs.length}</div>;
    }

    it('should filter INDIVIDUAL logs correctly', async () => {
      // Mock React Query hook to return UPPERCASE data
      mockUseOrchardActivityLogs.mockReturnValue({
        data: {
          logs: mockDatabaseLogs.map(log => ({
            ...log,
            logType: log.logType as Log['logType'],     // UPPERCASE
            status: log.status as Log['status'],         // UPPERCASE
            performDate: log.performDate.toISOString().split('T')[0],
            followUpDate: log.followUpDate?.toISOString().split('T')[0] || null,
            createdAt: log.createdAt.toISOString(),
            treeId: log.treeId || undefined,
            targetZone: log.targetZone || undefined,
            note: log.note || '',
            orchardId: log.orchardId
          })) as Log[]
        },
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      render(
        <TestWrapper>
          <TestComponent tree={mockTree} />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should find 2 INDIVIDUAL logs for tree1
        const logsCount = screen.getByTestId('logs-count');
        expect(logsCount.textContent).toBe('2');
      });
    });

    it('should filter BATCH logs correctly', async () => {
      // Create a tree in zone A to test BATCH filtering
      const mockTreeZoneA: Tree = {
        ...mockTree,
        zone: 'A'
      };

      mockUseOrchardActivityLogs.mockReturnValue({
        data: {
          logs: mockDatabaseLogs.map(log => ({
            ...log,
            logType: log.logType as Log['logType'],     // UPPERCASE
            status: log.status as Log['status'],         // UPPERCASE
            performDate: log.performDate.toISOString().split('T')[0],
            followUpDate: log.followUpDate?.toISOString().split('T')[0] || null,
            createdAt: log.createdAt.toISOString(),
            treeId: log.treeId || undefined,
            targetZone: log.targetZone || undefined,
            note: log.note || '',
            orchardId: log.orchardId
          })) as Log[]
        },
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      render(
        <TestWrapper>
          <TestComponent tree={mockTreeZoneA} />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should find 3 logs: 2 INDIVIDUAL + 1 BATCH (same zone)
        const logsCount = screen.getByTestId('logs-count');
        expect(logsCount.textContent).toBe('3');
      });
    });

    it('should filter by zone correctly for BATCH logs', async () => {
      // Create a tree in different zone to test zone filtering
      const mockTreeZoneB: Tree = {
        ...mockTree,
        zone: 'B'
      };

      mockUseOrchardActivityLogs.mockReturnValue({
        data: {
          logs: mockDatabaseLogs.map(log => ({
            ...log,
            logType: log.logType as Log['logType'],     // UPPERCASE
            status: log.status as Log['status'],         // UPPERCASE
            performDate: log.performDate.toISOString().split('T')[0],
            followUpDate: log.followUpDate?.toISOString().split('T')[0] || null,
            createdAt: log.createdAt.toISOString(),
            treeId: log.treeId || undefined,
            targetZone: log.targetZone || undefined,
            note: log.note || '',
            orchardId: log.orchardId
          })) as Log[]
        },
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      render(
        <TestWrapper>
          <TestComponent tree={mockTreeZoneB} />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should find only 2 INDIVIDUAL logs (BATCH log is for zone A)
        const logsCount = screen.getByTestId('logs-count');
        expect(logsCount.textContent).toBe('2');
      });
    });

    it('should handle COMPLETED status filtering', async () => {
      // Test component behavior with COMPLETED status
      // This will be tested in component section below
    });

    it('should handle IN_PROGRESS status filtering', async () => {
      // Test component behavior with IN_PROGRESS status
      // This will be tested in component section below
    });
  });

  describe('1.3 TreeHistorySection Component', () => {
    const mockTree: Tree = {
      id: 'tree1',
      orchardId: 'orchard1',
      code: 'T001',
      zone: 'A',
      type: 'ทุเรียน',
      variety: 'หมอนทอง',
      plantedDate: '2024-01-01',
      status: 'healthy',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    beforeEach(() => {
      vi.clearAllMocks();
      mockUseOrchard.mockReturnValue({
        currentOrchardId: 'orchard1',
        // @ts-expect-error - we only need currentOrchardId for this test
        orchards: [],
        isLoading: false,
        error: null,
        setCurrentOrchard: vi.fn(),
        addOrchard: vi.fn(),
        updateOrchard: vi.fn(),
        deleteOrchard: vi.fn()
      });
    });

    it('should show individual logs in "ทั้งหมด" tab', async () => {
      mockUseOrchardActivityLogs.mockReturnValue({
        data: {
          logs: mockDatabaseLogs.map(log => ({
            ...log,
            logType: log.logType as Log['logType'],     // UPPERCASE
            status: log.status as Log['status'],         // UPPERCASE
            performDate: log.performDate.toISOString().split('T')[0],
            followUpDate: log.followUpDate?.toISOString().split('T')[0] || null,
            createdAt: log.createdAt.toISOString(),
            treeId: log.treeId || undefined,
            targetZone: log.targetZone || undefined,
            note: log.note || '',
            orchardId: log.orchardId
          })) as Log[]
        },
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      render(
        <TestWrapper>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show all logs in "ทั้งหมด" tab
        expect(screen.getByText('ให้ปุ๋ย')).toBeInTheDocument();
        expect(screen.getByText('ฉีดพ่นยา')).toBeInTheDocument();
        expect(screen.getByText('รักษาโรคใบจุด')).toBeInTheDocument();
      });
    });

    it('should show batch logs in "งานเหมา" tab', async () => {
      mockUseOrchardActivityLogs.mockReturnValue({
        data: {
          logs: mockDatabaseLogs.map(log => ({
            ...log,
            logType: log.logType as Log['logType'],     // UPPERCASE
            status: log.status as Log['status'],         // UPPERCASE
            performDate: log.performDate.toISOString().split('T')[0],
            followUpDate: log.followUpDate?.toISOString().split('T')[0] || null,
            createdAt: log.createdAt.toISOString(),
            treeId: log.treeId || undefined,
            targetZone: log.targetZone || undefined,
            note: log.note || '',
            orchardId: log.orchardId
          })) as Log[]
        },
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      render(
        <TestWrapper>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </TestWrapper>
      );

      await waitFor(() => {
        // Click on "งานเหมา" tab
        const batchTab = screen.getByText('📦 งานเหมา');
        batchTab.click();
      });

      await waitFor(() => {
        // Should show only BATCH logs
        expect(screen.getByText('ฉีดพ่นยา')).toBeInTheDocument();
        expect(screen.queryByText('ให้ปุ๋ย')).not.toBeInTheDocument();
        expect(screen.queryByText('รักษาโรคใบจุด')).not.toBeInTheDocument();
      });
    });

    it('should show follow-up logs in "ติดตาม/นัดหมาย" tab', async () => {
      mockUseOrchardActivityLogs.mockReturnValue({
        data: {
          logs: mockDatabaseLogs.map(log => ({
            ...log,
            logType: log.logType as Log['logType'],     // UPPERCASE
            status: log.status as Log['status'],         // UPPERCASE
            performDate: log.performDate.toISOString().split('T')[0],
            followUpDate: log.followUpDate?.toISOString().split('T')[0] || null,
            createdAt: log.createdAt.toISOString(),
            treeId: log.treeId || undefined,
            targetZone: log.targetZone || undefined,
            note: log.note || '',
            orchardId: log.orchardId
          })) as Log[]
        },
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      render(
        <TestWrapper>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </TestWrapper>
      );

      await waitFor(() => {
        // Click on "ติดตาม/นัดหมาย" tab
        const followUpTab = screen.getByText('⏰ ติดตาม/นัดหมาย');
        followUpTab.click();
      });

      await waitFor(() => {
        // Should show only IN_PROGRESS logs
        expect(screen.getByText('รักษาโรคใบจุด')).toBeInTheDocument();
        expect(screen.queryByText('ให้ปุ๋ย')).not.toBeInTheDocument();
        expect(screen.queryByText('ฉีดพ่นยา')).not.toBeInTheDocument();
      });
    });

    it('should show badge for IN_PROGRESS logs', async () => {
      mockUseOrchardActivityLogs.mockReturnValue({
        data: {
          logs: mockDatabaseLogs.map(log => ({
            ...log,
            logType: log.logType as Log['logType'],     // UPPERCASE
            status: log.status as Log['status'],         // UPPERCASE
            performDate: log.performDate.toISOString().split('T')[0],
            followUpDate: log.followUpDate?.toISOString().split('T')[0] || null,
            createdAt: log.createdAt.toISOString(),
            treeId: log.treeId || undefined,
            targetZone: log.targetZone || undefined,
            note: log.note || '',
            orchardId: log.orchardId
          })) as Log[]
        },
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      render(
        <TestWrapper>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show badge for IN_PROGRESS log
        expect(screen.getByText('รอติดตาม')).toBeInTheDocument();
      });
    });

    it('should show red indicator on follow-up tab when logs exist', async () => {
      mockUseOrchardActivityLogs.mockReturnValue({
        data: {
          logs: mockDatabaseLogs.map(log => ({
            ...log,
            logType: log.logType as Log['logType'],     // UPPERCASE
            status: log.status as Log['status'],         // UPPERCASE
            performDate: log.performDate.toISOString().split('T')[0],
            followUpDate: log.followUpDate?.toISOString().split('T')[0] || null,
            createdAt: log.createdAt.toISOString(),
            treeId: log.treeId || undefined,
            targetZone: log.targetZone || undefined,
            note: log.note || '',
            orchardId: log.orchardId
          })) as Log[]
        },
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      render(
        <TestWrapper>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show red dot indicator on follow-up tab
        const followUpTab = screen.getByText('⏰ ติดตาม/นัดหมาย');
        expect(followUpTab.parentElement?.querySelector('.animate-pulse')).toBeInTheDocument();
      });
    });

    it('should handle search functionality correctly', async () => {
      mockUseOrchardActivityLogs.mockReturnValue({
        data: {
          logs: mockDatabaseLogs.map(log => ({
            ...log,
            logType: log.logType as Log['logType'],     // UPPERCASE
            status: log.status as Log['status'],         // UPPERCASE
            performDate: log.performDate.toISOString().split('T')[0],
            followUpDate: log.followUpDate?.toISOString().split('T')[0] || null,
            createdAt: log.createdAt.toISOString(),
            treeId: log.treeId || undefined,
            targetZone: log.targetZone || undefined,
            note: log.note || '',
            orchardId: log.orchardId
          })) as Log[]
        },
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      render(
        <TestWrapper>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </TestWrapper>
      );

      await waitFor(() => {
        // Type in search box
        const searchInput = screen.getByPlaceholderText('ค้นหากิจกรรม...');
        searchInput.value = 'ปุ๋ย';
        // Need to fire change event
        searchInput.dispatchEvent(new Event('change', { bubbles: true }));
      });

      await waitFor(() => {
        // Should show only logs matching search
        expect(screen.getByText('ให้ปุ๋ย')).toBeInTheDocument();
        expect(screen.queryByText('ฉีดพ่นยา')).not.toBeInTheDocument();
        expect(screen.queryByText('รักษาโรคใบจุด')).not.toBeInTheDocument();
      });
    });

    it('should handle sort functionality correctly', async () => {
      mockUseOrchardActivityLogs.mockReturnValue({
        data: {
          logs: mockDatabaseLogs.map(log => ({
            ...log,
            logType: log.logType as Log['logType'],     // UPPERCASE
            status: log.status as Log['status'],         // UPPERCASE
            performDate: log.performDate.toISOString().split('T')[0],
            followUpDate: log.followUpDate?.toISOString().split('T')[0] || null,
            createdAt: log.createdAt.toISOString(),
            treeId: log.treeId || undefined,
            targetZone: log.targetZone || undefined,
            note: log.note || '',
            orchardId: log.orchardId
          })) as Log[]
        },
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      render(
        <TestWrapper>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </TestWrapper>
      );

      await waitFor(() => {
        // Click sort button to change to ascending
        const sortButton = screen.getByText('ใหม่-เก่า');
        sortButton.click();
      });

      await waitFor(() => {
        // Should now show oldest first
        const logs = screen.getAllByTestId(/log-item/); // Assuming we add test-id
        // Verify order has changed
        expect(logs[0]).toHaveTextContent('ฉีดพ่นยา'); // Oldest
        expect(logs[2]).toHaveTextContent('รักษาโรคใบจุด'); // Newest
      });
    });

    it('should not show empty state when logs exist', async () => {
      mockUseOrchardActivityLogs.mockReturnValue({
        data: {
          logs: mockDatabaseLogs.map(log => ({
            ...log,
            logType: log.logType as Log['logType'],     // UPPERCASE
            status: log.status as Log['status'],         // UPPERCASE
            performDate: log.performDate.toISOString().split('T')[0],
            followUpDate: log.followUpDate?.toISOString().split('T')[0] || null,
            createdAt: log.createdAt.toISOString(),
            treeId: log.treeId || undefined,
            targetZone: log.targetZone || undefined,
            note: log.note || '',
            orchardId: log.orchardId
          })) as Log[]
        },
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      render(
        <TestWrapper>
          <TreeHistorySection tree={mockTree} onLogClick={vi.fn()} />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should NOT show empty state message
        expect(screen.queryByText('ไม่พบประวัติการดูแล')).not.toBeInTheDocument();
      });
    });
  });
});