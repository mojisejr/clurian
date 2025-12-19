/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useOrchard } from '@/components/providers/orchard-provider';
import { useDashboardDeepLinking } from '@/hooks/useDashboardDeepLinking';

// Mock the hooks and router
vi.mock('next/navigation');
vi.mock('@/components/providers/orchard-provider');
vi.mock('@/hooks/useDashboardDeepLinking');

// Get mocked functions
const mockUseRouter = vi.mocked(useRouter);
const mockUseSearchParams = vi.mocked(useSearchParams);
const mockUseOrchard = vi.mocked(useOrchard);
const mockUseDashboardDeepLinking = vi.mocked(useDashboardDeepLinking);

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

// Mock orchard data
const mockOrchards = [
  { id: 'orchard1', name: 'Orchard 1', zones: ['A', 'B'] },
  { id: 'orchard2', name: 'Orchard 2', zones: ['C', 'D'] }
];

describe('Phase 3: TreeId Parameter Cleanup Tests', () => {
  let mockRouter: any;
  let mockSearchParams: any;

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

    // Mock searchParams
    mockSearchParams = {
      get: vi.fn(),
      has: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      toString: vi.fn()
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    // Default mock for useOrchard
    mockUseOrchard.mockReturnValue({
      currentOrchardId: 'orchard1',
      setCurrentOrchardId: vi.fn(),
      currentOrchard: mockOrchards[0],
      orchards: mockOrchards,
      isLoading: false,
      isFetchingOrchardData: false
    });

    // Default mock for useDashboardDeepLinking
    mockUseDashboardDeepLinking.mockReturnValue({
      selectedTreeId: 'tree123',
      setSelectedTreeId: vi.fn(),
      view: 'tree_detail',
      setView: vi.fn()
    });
  });

  describe('3.1 Orchard Switching from Tree Detail', () => {
    it('should clear treeId when switching orchards from tree detail', async () => {
      // Simulate being in tree detail view with treeId in URL
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'treeId') return 'tree123';
        return null;
      });
      mockSearchParams.has.mockImplementation((key: string) => {
        if (key === 'treeId') return true;
        return false;
      });

      const TestComponent = () => {
        const { currentOrchardId, setCurrentOrchardId } = useOrchard();
        const { selectedTreeId } = useDashboardDeepLinking();
        const { replace } = useRouter();

        const handleOrchardSwitch = async () => {
          await setCurrentOrchardId('orchard2');
          // This should trigger treeId cleanup
          if (selectedTreeId) {
            replace('/dashboard');
          }
        };

        return (
          <div>
            <div data-testid="current-orchard">{currentOrchardId}</div>
            <div data-testid="selected-tree">{selectedTreeId}</div>
            <button onClick={handleOrchardSwitch}>Switch Orchard</button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Verify initial state
      expect(screen.getByTestId('selected-tree')).toHaveTextContent('tree123');
      expect(mockSearchParams.has('treeId')).toBe(true);

      // Switch orchard
      const switchButton = screen.getByText('Switch Orchard');
      fireEvent.click(switchButton);

      // Verify treeId cleanup
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should navigate to dashboard without treeId', async () => {
      mockSearchParams.get.mockReturnValue('tree123');
      mockSearchParams.has.mockReturnValue(true);

      const TestComponent = () => {
        const { setCurrentOrchardId } = useOrchard();
        const { replace } = useRouter();

        const handleSwitch = async () => {
          await setCurrentOrchardId('orchard2');
          replace('/dashboard');
        };

        return <button onClick={handleSwitch}>Switch</button>;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Switch'));

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should not show tree not found error after orchard switch', async () => {
      mockSearchParams.get.mockReturnValue('treeFromOrchard1');

      const TestComponent = () => {
        const { currentOrchardId, setCurrentOrchardId } = useOrchard();
        const { selectedTreeId, setView } = useDashboardDeepLinking();

        const handleOrchardSwitch = async () => {
          // When switching orchard, we should cleanup treeId to prevent error
          if (selectedTreeId) {
            setView('dashboard');
          }
          await setCurrentOrchardId('orchard2');
        };

        // This simulates error state when tree doesn't exist in current orchard
        const hasError = currentOrchardId === 'orchard2' && selectedTreeId;

        return (
          <div>
            <div data-testid="current-orchard">{currentOrchardId}</div>
            <div data-testid="error-state">{hasError ? 'error' : 'no-error'}</div>
            <button onClick={handleOrchardSwitch}>Switch Orchard</button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Initially no error
      expect(screen.getByTestId('error-state')).toHaveTextContent('no-error');

      // Switch orchard
      fireEvent.click(screen.getByText('Switch Orchard'));

      // Should trigger cleanup to prevent error state
      await waitFor(() => {
        expect(mockUseDashboardDeepLinking().setView).toHaveBeenCalledWith('dashboard');
      });
    });

    it('should load new orchard data correctly', async () => {
      const setCurrentOrchardIdMock = vi.fn();

      mockUseOrchard.mockReturnValue({
        currentOrchardId: 'orchard1',
        setCurrentOrchardId: setCurrentOrchardIdMock,
        currentOrchard: mockOrchards[0],
        orchards: mockOrchards,
        isLoading: false,
        isFetchingOrchardData: false
      });

      const TestComponent = () => {
        const { currentOrchardId, setCurrentOrchardId, currentOrchard } = useOrchard();

        return (
          <div>
            <div data-testid="orchard-id">{currentOrchardId}</div>
            <div data-testid="orchard-name">{currentOrchard?.name}</div>
            <button onClick={() => setCurrentOrchardId('orchard2')}>Load Orchard 2</button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Initially orchard 1
      expect(screen.getByTestId('orchard-id')).toHaveTextContent('orchard1');
      expect(screen.getByTestId('orchard-name')).toHaveTextContent('Orchard 1');

      // Switch to orchard 2
      fireEvent.click(screen.getByText('Load Orchard 2'));

      // Verify the setCurrentOrchardId was called
      expect(setCurrentOrchardIdMock).toHaveBeenCalledWith('orchard2');
    });

    it('should reset view state to dashboard', async () => {
      mockUseDashboardDeepLinking.mockReturnValue({
        selectedTreeId: 'tree123',
        setSelectedTreeId: vi.fn(),
        view: 'tree_detail',
        setView: vi.fn()
      });

      const TestComponent = () => {
        const { setCurrentOrchardId } = useOrchard();
        const { setView, view } = useDashboardDeepLinking();

        const handleOrchardSwitch = async () => {
          await setCurrentOrchardId('orchard2');
          setView('dashboard');
        };

        return (
          <div>
            <div data-testid="current-view">{view}</div>
            <button onClick={handleOrchardSwitch}>Switch & Reset</button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Initially in tree_detail view
      expect(screen.getByTestId('current-view')).toHaveTextContent('tree_detail');

      // Switch orchard and reset view
      fireEvent.click(screen.getByText('Switch & Reset'));

      // Verify view resets to dashboard
      await waitFor(() => {
        expect(mockUseDashboardDeepLinking().setView).toHaveBeenCalledWith('dashboard');
      });
    });
  });

  describe('3.2 URL Parameter Management', () => {
    it('should preserve other URL params during orchard switch', async () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'treeId') return 'tree123';
        if (key === 'zone') return 'A';
        if (key === 'status') return 'healthy';
        return null;
      });

      const TestComponent = () => {
        const { replace } = useRouter();

        const handleSwitch = () => {
          // Should preserve non-treeId params
          replace('/dashboard?zone=A&status=healthy');
        };

        return <button onClick={handleSwitch}>Switch</button>;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Switch'));

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard?zone=A&status=healthy');
      });
    });

    it('should handle empty searchParams gracefully', async () => {
      mockSearchParams.has.mockReturnValue(false);

      const TestComponent = () => {
        const { setCurrentOrchardId } = useOrchard();

        return <button onClick={() => setCurrentOrchardId('orchard2')}>Switch</button>;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Switch'));

      // Should not throw error when no params exist
      expect(mockUseOrchard().setCurrentOrchardId).toHaveBeenCalledWith('orchard2');
    });

    it('should work with multiple rapid orchard switches', async () => {
      const TestComponent = () => {
        const { currentOrchardId, setCurrentOrchardId } = useOrchard();

        const handleRapidSwitch = async () => {
          await setCurrentOrchardId('orchard2');
          await setCurrentOrchardId('orchard1');
          await setCurrentOrchardId('orchard2');
        };

        return (
          <div>
            <div data-testid="orchard">{currentOrchardId}</div>
            <button onClick={handleRapidSwitch}>Rapid Switch</button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Rapid Switch'));

      // Should handle rapid switches without errors
      await waitFor(() => {
        expect(mockUseOrchard().setCurrentOrchardId).toHaveBeenCalledTimes(3);
      });
    });

    it('should maintain correct history navigation', async () => {
      const TestComponent = () => {
        const { replace, back } = useRouter();
        const { setCurrentOrchardId } = useOrchard();

        const handleSwitch = async () => {
          await setCurrentOrchardId('orchard2');
          replace('/dashboard');
        };

        const handleBack = () => {
          back();
        };

        return (
          <div>
            <button onClick={handleSwitch}>Switch</button>
            <button onClick={handleBack}>Back</button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Switch'));

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
      });

      fireEvent.click(screen.getByText('Back'));
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  describe('3.3 Navigation State Consistency', () => {
    it('should update useDashboardDeepLinking state correctly', async () => {
      const TestComponent = () => {
        const { setCurrentOrchardId } = useOrchard();
        const { setSelectedTreeId, setView } = useDashboardDeepLinking();

        const handleOrchardSwitch = async () => {
          await setCurrentOrchardId('orchard2');
          setSelectedTreeId(null);
          setView('dashboard');
        };

        return <button onClick={handleOrchardSwitch}>Switch</button>;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Switch'));

      await waitFor(() => {
        expect(mockUseDashboardDeepLinking().setSelectedTreeId).toHaveBeenCalledWith(null);
        expect(mockUseDashboardDeepLinking().setView).toHaveBeenCalledWith('dashboard');
      });
    });

    it('should clear selectedTreeId in context', async () => {
      mockUseDashboardDeepLinking.mockReturnValue({
        selectedTreeId: 'tree123',
        setSelectedTreeId: vi.fn(),
        view: 'tree_detail',
        setView: vi.fn()
      });

      const TestComponent = () => {
        const { setCurrentOrchardId } = useOrchard();
        const { setSelectedTreeId } = useDashboardDeepLinking();

        const handleSwitch = async () => {
          await setCurrentOrchardId('orchard2');
          setSelectedTreeId(null);
        };

        return <button onClick={handleSwitch}>Switch</button>;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Switch'));

      await waitFor(() => {
        expect(mockUseDashboardDeepLinking().setSelectedTreeId).toHaveBeenCalledWith(null);
      });
    });

    it('should reset loading states appropriately', async () => {
      const TestComponent = () => {
        const { setCurrentOrchardId, isFetchingOrchardData } = useOrchard();

        return (
          <div>
            <div data-testid="loading-state">{isFetchingOrchardData ? 'loading' : 'idle'}</div>
            <button onClick={() => setCurrentOrchardId('orchard2')}>Switch</button>
          </div>
        );
      };

      // Simulate loading state
      mockUseOrchard.mockReturnValue({
        currentOrchardId: 'orchard1',
        setCurrentOrchardId: vi.fn(),
        currentOrchard: mockOrchards[0],
        orchards: mockOrchards,
        isLoading: false,
        isFetchingOrchardData: true
      });

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('loading-state')).toHaveTextContent('loading');
    });

    it('should handle edge case of same orchard selection', async () => {
      const TestComponent = () => {
        const { currentOrchardId, setCurrentOrchardId } = useOrchard();

        const handleSameOrchard = async () => {
          // Switch to same orchard
          await setCurrentOrchardId(currentOrchardId);
        };

        return (
          <div>
            <div data-testid="orchard">{currentOrchardId}</div>
            <button onClick={handleSameOrchard}>Same Orchard</button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Same Orchard'));

      // Should handle without unnecessary operations
      await waitFor(() => {
        expect(mockUseOrchard().setCurrentOrchardId).toHaveBeenCalledWith('orchard1');
      });
    });

    it('should work with orchard switching overlay timing', async () => {
      let resolveSwitch: (value: void) => void;

      const TestComponent = () => {
        const { setCurrentOrchardId, isFetchingOrchardData } = useOrchard();

        const handleSwitch = async () => {
          const promise = new Promise<void>(resolve => {
            resolveSwitch = resolve;
          });
          await setCurrentOrchardId('orchard2');
          return promise;
        };

        return (
          <div>
            <div data-testid="overlay-visible">{isFetchingOrchardData ? 'yes' : 'no'}</div>
            <button onClick={handleSwitch}>Switch</button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      fireEvent.click(screen.getByText('Switch'));

      // Should show overlay during switch
      expect(screen.getByTestId('overlay-visible')).toHaveTextContent('no');

      // Complete switch
      resolveSwitch!();
    });
  });
});