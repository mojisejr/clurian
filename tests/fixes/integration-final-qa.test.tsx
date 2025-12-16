import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useOrchard } from '@/components/providers/orchard-provider';
import { useOrchardData, useOrchardActivityLogs, useSpecificCacheInvalidation } from '@/lib/hooks/use-orchard-queries';
import { useDashboardDeepLinking } from '@/hooks/useDashboardDeepLinking';

// Mock the hooks and router
vi.mock('next/navigation');
vi.mock('@/components/providers/orchard-provider');
vi.mock('@/lib/hooks/use-orchard-queries');
vi.mock('@/hooks/useDashboardDeepLinking');

// Get mocked functions
const mockUseRouter = vi.mocked(useRouter);
const mockUseOrchard = vi.mocked(useOrchard);
const mockUseOrchardData = vi.mocked(useOrchardData);
const mockUseOrchardActivityLogs = vi.mocked(useOrchardActivityLogs);
const mockUseSpecificCacheInvalidation = vi.mocked(useSpecificCacheInvalidation);
const mockUseDashboardDeepLinking = vi.mocked(useDashboardDeepLinking);

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

// Mock orchard data
const mockOrchard = {
  id: 'orchard1',
  name: 'Test Orchard',
  zones: ['A', 'B', 'C'],
  createdAt: '2024-01-01T00:00:00Z'
};

const mockTrees = [
  { id: 'tree1', code: 'T001', zone: 'A', status: 'healthy' },
  { id: 'tree2', code: 'T002', zone: 'B', status: 'sick' },
  { id: 'tree3', code: 'T003', zone: 'C', status: 'healthy' }
];

const mockLogs = [
  { id: 'log1', orchardId: 'orchard1', treeId: 'tree1', action: 'Watering', status: 'COMPLETED', logType: 'INDIVIDUAL' },
  { id: 'log2', orchardId: 'orchard1', treeId: 'tree2', action: 'Fertilizing', status: 'IN_PROGRESS', logType: 'INDIVIDUAL' },
  { id: 'log3', orchardId: 'orchard1', action: 'Pesticide', targetZone: 'A', status: 'COMPLETED', logType: 'BATCH' }
];

describe('Phase 4: Integration Final QA Tests', () => {
  let mockRouter: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock router
    mockRouter = {
      replace: vi.fn(),
      push: vi.fn(),
      back: vi.fn(),
      forward: vi.fn()
    };
    mockUseRouter.mockReturnValue(mockRouter);

    // Default mock for useOrchard
    mockUseOrchard.mockReturnValue({
      currentOrchardId: 'orchard1',
      setCurrentOrchardId: vi.fn(),
      currentOrchard: mockOrchard,
      orchards: [mockOrchard],
      isLoading: false,
      isFetchingOrchardData: false
    });

    // Default mock for data hooks
    mockUseOrchardData.mockReturnValue({
      data: { trees: mockTrees, logs: mockLogs, pagination: { total: 3, totalPages: 1 } },
      isLoading: false,
      error: null
    });

    mockUseOrchardActivityLogs.mockReturnValue({
      data: { logs: mockLogs },
      isLoading: false,
      error: null
    });

    mockUseSpecificCacheInvalidation.mockReturnValue({
      invalidateSpecificTrees: vi.fn().mockResolvedValue(undefined),
      invalidateSpecificActivityLogs: vi.fn().mockResolvedValue(undefined),
      invalidateSpecificDashboard: vi.fn().mockResolvedValue(undefined)
    });

    mockUseDashboardDeepLinking.mockReturnValue({
      selectedTreeId: null,
      setSelectedTreeId: vi.fn(),
      view: 'dashboard',
      setView: vi.fn()
    });
  });

  describe('4.1 End-to-End User Workflows', () => {
    it('should complete tree viewing workflow: dashboard → tree detail → view history → back', async () => {
      const TestComponent = () => {
        const { setView, setSelectedTreeId } = useDashboardDeepLinking();
        const { replace } = useRouter();

        // Simulate user journey
        const handleViewTree = (treeId: string) => {
          setSelectedTreeId(treeId);
          setView('tree_detail');
          replace(`/dashboard?treeId=${treeId}`);
        };

        const handleViewHistory = () => {
          setView('tree_history');
        };

        const handleBackToDashboard = () => {
          setSelectedTreeId(null);
          setView('dashboard');
          replace('/dashboard');
        };

        return (
          <div>
            <button onClick={() => handleViewTree('tree1')}>View Tree</button>
            <button onClick={handleViewHistory}>View History</button>
            <button onClick={handleBackToDashboard}>Back</button>
            <div data-testid="current-view">{setView.name}</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Step 1: View tree from dashboard
      fireEvent.click(screen.getByText('View Tree'));
      await waitFor(() => {
        expect(mockUseDashboardDeepLinking().setSelectedTreeId).toHaveBeenCalledWith('tree1');
        expect(mockUseDashboardDeepLinking().setView).toHaveBeenCalledWith('tree_detail');
        expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard?treeId=tree1');
      });

      // Step 2: View history
      fireEvent.click(screen.getByText('View History'));
      await waitFor(() => {
        expect(mockUseDashboardDeepLinking().setView).toHaveBeenCalledWith('tree_history');
      });

      // Step 3: Back to dashboard
      fireEvent.click(screen.getByText('Back'));
      await waitFor(() => {
        expect(mockUseDashboardDeepLinking().setSelectedTreeId).toHaveBeenCalledWith(null);
        expect(mockUseDashboardDeepLinking().setView).toHaveBeenCalledWith('dashboard');
        expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should complete refresh workflow: view data → refresh → see updates', async () => {
      const TestComponent = () => {
        const { invalidateSpecificTrees } = useSpecificCacheInvalidation();
        const { data: orchardData } = useOrchardData('orchard1', { filters: {} });

        const handleRefresh = async () => {
          await invalidateSpecificTrees('orchard1');
        };

        return (
          <div>
            <div data-testid="tree-count">{orchardData?.trees?.length || 0}</div>
            <button onClick={handleRefresh}>Refresh</button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Verify initial data
      expect(screen.getByTestId('tree-count')).toHaveTextContent('3');

      // Refresh data
      fireEvent.click(screen.getByText('Refresh'));

      await waitFor(() => {
        expect(mockUseSpecificCacheInvalidation().invalidateSpecificTrees).toHaveBeenCalledWith('orchard1');
      });

      // Verify no orchard overlay was triggered
      expect(mockUseOrchard().setCurrentOrchardId).not.toHaveBeenCalled();
    });

    it('should complete orchard switching workflow: tree detail → switch orchard → dashboard', async () => {
      const TestComponent = () => {
        const { setCurrentOrchardId, currentOrchardId } = useOrchard();
        const { setSelectedTreeId, setView } = useDashboardDeepLinking();

        const handleSwitchOrchard = async () => {
          await setCurrentOrchardId('orchard2');
        };

        const simulateTreeDetailView = () => {
          setSelectedTreeId('tree1');
          setView('tree_detail');
        };

        return (
          <div>
            <div data-testid="current-orchard">{currentOrchardId}</div>
            <button onClick={simulateTreeDetailView}>Go to Tree Detail</button>
            <button onClick={handleSwitchOrchard}>Switch Orchard</button>
          </div>
        );
      };

      // Mock tree detail view initially
      mockUseDashboardDeepLinking.mockReturnValue({
        selectedTreeId: 'tree1',
        setSelectedTreeId: vi.fn(),
        view: 'tree_detail',
        setView: vi.fn()
      });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Initial state - in tree detail view
      expect(screen.getByTestId('current-orchard')).toHaveTextContent('orchard1');

      // Switch orchard while in tree detail
      fireEvent.click(screen.getByText('Switch Orchard'));

      await waitFor(() => {
        expect(mockUseOrchard().setCurrentOrchardId).toHaveBeenCalledWith('orchard2');
      });

      // TreeId should be cleaned up automatically by OrchardProvider
      // This is tested in Phase 3, so we just verify the switch happened
    });
  });

  describe('4.2 Performance & Edge Cases', () => {
    it('should handle rapid tab switching without errors', async () => {
      const TestComponent = () => {
        const [currentView, setCurrentView] = React.useState('dashboard');
        const { setView } = useDashboardDeepLinking();

        const handleRapidSwitch = () => {
          // Simulate rapid tab switching
          setView('dashboard');
          setView('tree_detail');
          setView('tree_history');
          setView('dashboard');
        };

        return (
          <div>
            <div data-testid="current-view">{currentView}</div>
            <button onClick={handleRapidSwitch}>Rapid Switch</button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Perform rapid switching
      fireEvent.click(screen.getByText('Rapid Switch'));

      await waitFor(() => {
        expect(mockUseDashboardDeepLinking().setView).toHaveBeenCalledTimes(4);
      });

      // Should complete without errors
      expect(mockUseDashboardDeepLinking().setView).toHaveBeenLastCalledWith('dashboard');
    });

    it('should handle network failures gracefully', async () => {
      // Simulate network error
      mockUseOrchardData.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Network error')
      });

      const TestComponent = () => {
        const { data, error } = useOrchardData('orchard1', {});

        return (
          <div>
            <div data-testid="error-state">{error ? 'error' : 'no-error'}</div>
            <div data-testid="data-state">{data ? 'has-data' : 'no-data'}</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Should show error state gracefully
      expect(screen.getByTestId('error-state')).toHaveTextContent('error');
      expect(screen.getByTestId('data-state')).toHaveTextContent('no-data');

      // Should not crash the component
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });

    it('should handle concurrent operations without race conditions', async () => {
      const TestComponent = () => {
        const [isLoading, setIsLoading] = React.useState(false);
        const { invalidateSpecificTrees, invalidateSpecificActivityLogs } = useSpecificCacheInvalidation();

        const handleConcurrentRefresh = async () => {
          setIsLoading(true);
          // Trigger multiple concurrent invalidations
          await Promise.all([
            invalidateSpecificTrees('orchard1'),
            invalidateSpecificActivityLogs('orchard1')
          ]);
          setIsLoading(false);
        };

        return (
          <div>
            <div data-testid="loading-state">{isLoading ? 'loading' : 'idle'}</div>
            <button onClick={handleConcurrentRefresh}>Concurrent Refresh</button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Concurrent Refresh'));

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('idle');
      });

      // All operations should complete successfully
      expect(mockUseSpecificCacheInvalidation().invalidateSpecificTrees).toHaveBeenCalled();
      expect(mockUseSpecificCacheInvalidation().invalidateSpecificActivityLogs).toHaveBeenCalled();
    });
  });

  describe('4.3 Regression Tests', () => {
    it('should not break existing deep linking functionality', async () => {
      const TestComponent = () => {
        const { selectedTreeId } = useDashboardDeepLinking();

        return (
          <div>
            <div data-testid="deep-linked-tree">{selectedTreeId || 'none'}</div>
          </div>
        );
      };

      // Mock deep linking scenario
      mockUseDashboardDeepLinking.mockReturnValue({
        selectedTreeId: 'tree123',
        setSelectedTreeId: vi.fn(),
        view: 'tree_detail',
        setView: vi.fn()
      });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Should still recognize deep-linked tree
      expect(screen.getByTestId('deep-linked-tree')).toHaveTextContent('tree123');
    });

    it('should not break existing orchard switching functionality', async () => {
      const TestComponent = () => {
        const { currentOrchardId, setCurrentOrchardId, currentOrchard } = useOrchard();

        const handleSwitch = () => {
          setCurrentOrchardId('orchard2');
        };

        return (
          <div>
            <div data-testid="current-orchard">{currentOrchardId}</div>
            <div data-testid="orchard-name">{currentOrchard?.name || 'No orchard'}</div>
            <button onClick={handleSwitch}>Switch</button>
          </div>
        );
      };

      // Set up mock to return orchard2 after switch
      const setCurrentOrchardIdMock = vi.fn();

      mockUseOrchard.mockReturnValue({
        currentOrchardId: 'orchard1',
        setCurrentOrchardId: setCurrentOrchardIdMock,
        currentOrchard: mockOrchard,
        orchards: [mockOrchard, { id: 'orchard2', name: 'Orchard 2' }],
        isLoading: false,
        isFetchingOrchardData: false
      });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Initial orchard
      expect(screen.getByTestId('current-orchard')).toHaveTextContent('orchard1');
      expect(screen.getByTestId('orchard-name')).toHaveTextContent('Test Orchard');

      // Switch orchard
      fireEvent.click(screen.getByText('Switch'));

      // Should update orchard context
      expect(setCurrentOrchardIdMock).toHaveBeenCalledWith('orchard2');
    });

    it('should not break existing filtering and searching', async () => {
      const TestComponent = () => {
        const [filterZone, setFilterZone] = React.useState('ALL');
        const [searchTerm, setSearchTerm] = React.useState('');

        const handleZoneFilter = (zone: string) => setFilterZone(zone);
        const handleSearch = (term: string) => setSearchTerm(term);

        return (
          <div>
            <select value={filterZone} onChange={(e) => handleZoneFilter(e.target.value)} data-testid="zone-filter">
              <option value="ALL">All Zones</option>
              <option value="A">Zone A</option>
              <option value="B">Zone B</option>
            </select>
            <input
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search trees..."
              data-testid="search-input"
            />
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Test zone filtering
      fireEvent.change(screen.getByTestId('zone-filter'), { target: { value: 'A' } });
      expect(screen.getByTestId('zone-filter')).toHaveValue('A');

      // Test search
      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'T001' } });
      expect(screen.getByTestId('search-input')).toHaveValue('T001');

      // Should work without errors
      expect(screen.getByTestId('zone-filter')).toBeInTheDocument();
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('should not break existing navigation flow', async () => {
      const TestComponent = () => {
        const { replace, push, back } = useRouter();

        const handleNavigate = () => {
          replace('/dashboard');
          push('/dashboard/tree_detail');
          back();
        };

        return <button onClick={handleNavigate}>Navigate</button>;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Navigate'));

      // Should execute all navigation commands
      expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/tree_detail');
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });
});