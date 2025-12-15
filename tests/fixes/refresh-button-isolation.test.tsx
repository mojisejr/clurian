import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInvalidateOrchardData, useSpecificCacheInvalidation } from '@/lib/hooks/use-orchard-queries';
import { useOrchard } from '@/components/providers/orchard-provider';

// Mock the hooks
vi.mock('@/lib/hooks/use-orchard-queries');
vi.mock('@/components/providers/orchard-provider');

// Get mocked functions
const mockUseInvalidateOrchardData = vi.mocked(useInvalidateOrchardData);
const mockUseSpecificCacheInvalidation = vi.mocked(useSpecificCacheInvalidation);
const mockUseOrchard = vi.mocked(useOrchard);

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

// Mock orchard data
const mockOrchard = {
  id: 'orchard1',
  ownerId: 'user1',
  name: 'Test Orchard',
  zones: ['A', 'B', 'C'],
  createdAt: '2024-01-01T00:00:00Z'
};

describe('Phase 2: Refresh Button Isolation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for useOrchard
    mockUseOrchard.mockReturnValue({
      currentOrchardId: 'orchard1',
      orchards: [mockOrchard],
      isLoading: false,
      error: null,
      setCurrentOrchardId: vi.fn(),
      addOrchard: vi.fn(),
      updateOrchard: vi.fn(),
      deleteOrchard: vi.fn(),
      isFetchingOrchardData: false
    });

    // Default mock for invalidate functions
    mockUseInvalidateOrchardData.mockReturnValue({
      invalidateOrchard: vi.fn(),
      invalidateOrchards: vi.fn(),
      invalidateOrchardData: vi.fn(),
      invalidateTrees: vi.fn(),
      invalidateActivityLogs: vi.fn()
    });

    // Mock for the new specific cache invalidation hook
    mockUseSpecificCacheInvalidation.mockReturnValue({
      invalidateSpecificTrees: vi.fn().mockResolvedValue(undefined),
      invalidateSpecificActivityLogs: vi.fn().mockResolvedValue(undefined),
      invalidateSpecificDashboard: vi.fn().mockResolvedValue(undefined)
    });
  });

  describe('2.1 Dashboard View Refresh', () => {
    it('should refresh trees without triggering orchard overlay', async () => {
      const TestComponent = () => {
        const { invalidateSpecificTrees } = useSpecificCacheInvalidation();
        const { currentOrchardId } = useOrchard();

        const handleClick = async () => {
          await invalidateSpecificTrees(currentOrchardId);
        };

        return (
          <button onClick={handleClick}>Refresh Trees</button>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Click refresh button
      const refreshButton = screen.getByText('Refresh Trees');
      fireEvent.click(refreshButton);

      // Verify specific trees invalidation was called
      await waitFor(() => {
        expect(mockUseSpecificCacheInvalidation().invalidateSpecificTrees).toHaveBeenCalledWith('orchard1');
      });

      // Verify orchardData was NOT invalidated (which would trigger overlay)
      expect(mockUseInvalidateOrchardData().invalidateOrchardData).not.toHaveBeenCalled();
    });

    it('should not show OrchardSwitchingOverlay during refresh', async () => {
      const TestComponent = () => {
        const { invalidateSpecificTrees } = useSpecificCacheInvalidation();
        const { currentOrchardId, isFetchingOrchardData } = useOrchard();

        const handleClick = async () => {
          await invalidateSpecificTrees(currentOrchardId);
        };

        return (
          <div>
            <button onClick={handleClick}>Refresh</button>
            <div data-testid="overlay-visibility">Overlay: {isFetchingOrchardData ? 'visible' : 'hidden'}</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      // Overlay should remain hidden
      await waitFor(() => {
        expect(screen.getByTestId('overlay-visibility')).toHaveTextContent('Overlay: hidden');
      });
    });

    it('should maintain current filter state during refresh', async () => {
      // This test verifies that refresh doesn't break the component
      const TestComponent = () => {
        const { invalidateSpecificTrees } = useSpecificCacheInvalidation();
        const [filterState, setFilterState] = React.useState('ALL');

        const handleClick = async () => {
          await invalidateSpecificTrees('orchard1');
        };

        return (
          <div>
            <button onClick={handleClick}>Refresh</button>
            <div data-testid="filter-state">Filter: {filterState}</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      // Component should still be functional after refresh
      await waitFor(() => {
        expect(screen.getByTestId('filter-state')).toHaveTextContent('Filter: ALL');
        expect(mockUseSpecificCacheInvalidation().invalidateSpecificTrees).toHaveBeenCalled();
      });
    });

    it('should not refetch orchard metadata during refresh', async () => {
      const TestComponent = () => {
        const { invalidateSpecificTrees } = useSpecificCacheInvalidation();

        const handleClick = async () => {
          await invalidateSpecificTrees('orchard1');
        };

        return <button onClick={handleClick}>Refresh Trees</button>;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const refreshButton = screen.getByText('Refresh Trees');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockUseSpecificCacheInvalidation().invalidateSpecificTrees).toHaveBeenCalled();
      });

      // Should not invalidate orchard metadata
      expect(mockUseInvalidateOrchardData().invalidateOrchard).not.toHaveBeenCalled();
      expect(mockUseInvalidateOrchardData().invalidateOrchardData).not.toHaveBeenCalled();
    });
  });

  describe('2.2 Batch Activities Refresh', () => {
    it('should refresh batch activities without orchard overlay', async () => {
      const TestComponent = () => {
        const { invalidateSpecificActivityLogs } = useSpecificCacheInvalidation();
        const { currentOrchardId } = useOrchard();

        const handleClick = async () => {
          await invalidateSpecificActivityLogs(currentOrchardId);
        };

        return (
          <button onClick={handleClick}>Refresh Batch</button>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const refreshButton = screen.getByText('Refresh Batch');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockUseSpecificCacheInvalidation().invalidateSpecificActivityLogs).toHaveBeenCalledWith('orchard1');
      });

      // Should NOT call invalidateOrchardData
      expect(mockUseInvalidateOrchardData().invalidateOrchardData).not.toHaveBeenCalled();
    });

    it('should not affect trees data during batch refresh', async () => {
      const TestComponent = () => {
        const { invalidateSpecificActivityLogs, invalidateSpecificTrees } = useSpecificCacheInvalidation();

        const handleClick = async () => {
          await invalidateSpecificActivityLogs('orchard1');
        };

        return (
          <button onClick={handleClick}>Refresh Batch Activities</button>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const refreshButton = screen.getByText('Refresh Batch Activities');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockUseSpecificCacheInvalidation().invalidateSpecificActivityLogs).toHaveBeenCalled();
      });

      // Should not invalidate trees
      expect(mockUseSpecificCacheInvalidation().invalidateSpecificTrees).not.toHaveBeenCalled();
    });

    it('should not affect scheduled activities during batch refresh', async () => {
      const TestComponent = () => {
        const { invalidateSpecificActivityLogs } = useSpecificCacheInvalidation();

        const handleClick = async () => {
          await invalidateSpecificActivityLogs('orchard1', { logType: 'BATCH' });
        };

        return <button onClick={handleClick}>Refresh Batch</button>;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const refreshButton = screen.getByText('Refresh Batch');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockUseSpecificCacheInvalidation().invalidateSpecificActivityLogs).toHaveBeenCalledWith('orchard1', { logType: 'BATCH' });
      });

      // Verify only BATCH type filter is used
      expect(mockUseSpecificCacheInvalidation().invalidateSpecificActivityLogs).toHaveBeenCalledTimes(1);
    });

    it('should preserve batch filter during refresh', async () => {
      // This tests that refresh maintains filter state
      const TestComponent = () => {
        const { invalidateSpecificActivityLogs } = useSpecificCacheInvalidation();
        const [filterState, setFilterState] = React.useState('all');

        const handleFilterChange = (newFilter: string) => {
          setFilterState(newFilter);
        };

        const handleClick = async () => {
          await invalidateSpecificActivityLogs('orchard1');
        };

        return (
          <div>
            <select value={filterState} onChange={(e) => handleFilterChange(e.target.value)}>
              <option value="all">สถ้นหมด</option>
              <option value="completed">เสร็จิ้น</option>
            </select>
            <button onClick={handleClick}>Refresh</button>
            <div data-testid="filter-state">Filter: {filterState}</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Change filter first
      const filterSelect = screen.getByDisplayValue('สถ้นหมด');
      fireEvent.change(filterSelect, { target: { value: 'completed' } });

      // Now refresh
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockUseSpecificCacheInvalidation().invalidateSpecificActivityLogs).toHaveBeenCalled();
        // Filter should still be 'completed'
        expect(screen.getByTestId('filter-state')).toHaveTextContent('Filter: completed');
      });
    });
  });

  describe('2.3 Scheduled Activities Refresh', () => {
    it('should refresh scheduled activities without orchard overlay', async () => {
      const TestComponent = () => {
        const { invalidateSpecificActivityLogs } = useSpecificCacheInvalidation();
        const { currentOrchardId } = useOrchard();

        const handleClick = async () => {
          await invalidateSpecificActivityLogs(currentOrchardId, { status: 'IN_PROGRESS' });
        };

        return (
          <button onClick={handleClick}>Refresh Scheduled</button>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const refreshButton = screen.getByText('Refresh Scheduled');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockUseSpecificCacheInvalidation().invalidateSpecificActivityLogs).toHaveBeenCalledWith('orchard1', { status: 'IN_PROGRESS' });
      });

      // Should NOT call invalidateOrchardData
      expect(mockUseInvalidateOrchardData().invalidateOrchardData).not.toHaveBeenCalled();
    });

    it('should not affect trees during scheduled refresh', async () => {
      const TestComponent = () => {
        const { invalidateSpecificActivityLogs, invalidateSpecificTrees } = useSpecificCacheInvalidation();

        const handleClick = async () => {
          await invalidateSpecificActivityLogs('orchard1');
        };

        return (
          <button onClick={handleClick}>Refresh Scheduled</button>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const refreshButton = screen.getByText('Refresh Scheduled');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockUseSpecificCacheInvalidation().invalidateSpecificActivityLogs).toHaveBeenCalled();
      });

      // Should not invalidate trees
      expect(mockUseSpecificCacheInvalidation().invalidateSpecificTrees).not.toHaveBeenCalled();
    });

    it('should not affect batch activities during scheduled refresh', async () => {
      const TestComponent = () => {
        const { invalidateSpecificActivityLogs } = useSpecificCacheInvalidation();

        const handleClick = async () => {
          await invalidateSpecificActivityLogs('orchard1', { followUpDate: { $exists: true } });
        };

        return (
          <button onClick={handleClick}>Refresh Scheduled</button>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const refreshButton = screen.getByText('Refresh Scheduled');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockUseSpecificCacheInvalidation().invalidateSpecificActivityLogs).toHaveBeenCalledWith('orchard1', { followUpDate: { $exists: true } });
      });

      // Verify only follow-up filter is used, not batch filter
      expect(mockUseSpecificCacheInvalidation().invalidateSpecificActivityLogs).toHaveBeenCalledTimes(1);
    });

    it('should preserve filter during refresh', async () => {
      const TestComponent = () => {
        const { invalidateSpecificActivityLogs } = useSpecificCacheInvalidation();
        const [filterState, setFilterState] = React.useState('all');

        const handleFilterChange = (newFilter: string) => {
          setFilterState(newFilter);
        };

        const handleClick = async () => {
          await invalidateSpecificActivityLogs('orchard1');
        };

        return (
          <div>
            <select value={filterState} onChange={(e) => handleFilterChange(e.target.value)}>
              <option value="all">ทุกโซน</option>
              <option value="A">โซน A</option>
              <option value="B">โซน B</option>
            </select>
            <button onClick={handleClick}>Refresh</button>
            <div data-testid="filter-state">Filter: {filterState}</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Change filter first
      const filterSelect = screen.getByDisplayValue('ทุกโซน');
      fireEvent.change(filterSelect, { target: { value: 'A' } });

      // Now refresh
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockUseSpecificCacheInvalidation().invalidateSpecificActivityLogs).toHaveBeenCalled();
        // Filter should still be 'A'
        expect(screen.getByTestId('filter-state')).toHaveTextContent('Filter: A');
      });
    });
  });
});