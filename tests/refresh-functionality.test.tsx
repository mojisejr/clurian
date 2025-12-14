import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RefreshButton } from '@/components/ui/refresh-button'
import { PullToRefresh } from '@/components/ui/pull-to-refresh'
import * as orchardHooks from '@/lib/hooks/use-orchard-queries'

// Mock React Query hooks
vi.mock('@/lib/hooks/use-orchard-queries')

const mockOrchardHooks = orchardHooks as any

describe('Refresh Functionality', () => {
  let queryClient: QueryClient
  let wrapper: React.FC<{ children: React.ReactNode }>

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    })

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )

    vi.clearAllMocks()

    // Setup default mocks
    mockOrchardHooks.useInvalidateOrchardData = vi.fn().mockReturnValue({
      invalidateOrchard: vi.fn(),
      invalidateTrees: vi.fn(),
      invalidateActivityLogs: vi.fn(),
      invalidateDashboard: vi.fn(),
      invalidateAllOrchardData: vi.fn(),
    })

    mockOrchardHooks.useOrchardData = vi.fn().mockReturnValue({
      data: { trees: [], logs: [] },
      isLoading: false,
      error: null,
      refetch: vi.fn().mockResolvedValue({ data: { trees: [], logs: [] } }),
    })

    // Mock touch events for pull-to-refresh
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      value: null,
    })
  })

  afterEach(() => {
    queryClient.clear()
  })

  describe('RefreshButton Component', () => {
    it('should render refresh button', () => {
      render(
        <RefreshButton
          onClick={() => {}}
          label="รีเฟรชข้อมูล"
        />,
        { wrapper }
      )

      expect(screen.getByRole('button', { name: /รีเฟรชข้อมูล/i })).toBeInTheDocument()
      expect(screen.getByTestId('refresh-icon')).toBeInTheDocument()
    })

    it('should show loading state during refresh', async () => {
      const mockOnClick = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      render(
        <RefreshButton
          onClick={mockOnClick}
          label="รีเฟรชข้อมูล"
        />,
        { wrapper }
      )

      const button = screen.getByRole('button', { name: /รีเฟรชข้อมูล/i })

      fireEvent.click(button)

      // Should show loading state
      expect(screen.getByTestId('refresh-spinner')).toBeInTheDocument()
      expect(button).toBeDisabled()

      await waitFor(() => {
        expect(screen.getByTestId('refresh-icon')).toBeInTheDocument()
        expect(button).not.toBeDisabled()
      })
    })

    it('should call onClick when clicked', () => {
      const mockOnClick = vi.fn()

      render(
        <RefreshButton
          onClick={mockOnClick}
          label="รีเฟรชข้อมูล"
        />,
        { wrapper }
      )

      const button = screen.getByRole('button', { name: /รีเฟรชข้อมูล/i })
      fireEvent.click(button)

      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('should support different button variants', () => {
      const { rerender } = render(
        <RefreshButton
          onClick={() => {}}
          label="รีเฟรช"
          variant="outline"
        />,
        { wrapper }
      )

      expect(screen.getByRole('button')).toHaveClass('variant-outline')

      rerender(
        <RefreshButton
          onClick={() => {}}
          label="รีเฟรช"
          variant="ghost"
        />,
        { wrapper }
      )

      expect(screen.getByRole('button')).toHaveClass('variant-ghost')
    })

    it('should show tooltip when provided', () => {
      render(
        <RefreshButton
          onClick={() => {}}
          label="รีเฟรช"
          tooltip="ดึงข้อมูลล่าสุดจากเซิร์ฟเวอร์"
        />,
        { wrapper }
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('title', 'ดึงข้อมูลล่าสุดจากเซิร์ฟเวอร์')
    })
  })

  describe('PullToRefresh Component', () => {
    beforeEach(() => {
      // Mock IntersectionObserver
      global.IntersectionObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        disconnect: vi.fn(),
      }))

      // Mock touch events
      const mockTouchEvent = (type: string, touches: any[]) => {
        const event = new Event(type, { bubbles: true })
        Object.defineProperty(event, 'touches', {
          get: () => touches,
        })
        Object.defineProperty(event, 'changedTouches', {
          get: () => touches,
        })
        return event
      }

      vi.stubGlobal('TouchEvent', mockTouchEvent)
    })

    it('should render children without pull indicator on desktop', () => {
      render(
        <PullToRefresh onRefresh={() => {}}>
          <div>Content</div>
        </PullToRefresh>,
        { wrapper }
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.queryByTestId('pull-indicator')).not.toBeInTheDocument()
    })

    it('should show pull indicator on touch devices', async () => {
      // Mock touch device
      Object.defineProperty(window, 'ontouchstart', {
        writable: true,
        value: () => {},
      })

      render(
        <PullToRefresh onRefresh={() => {}}>
          <div>Content</div>
        </PullToRefresh>,
        { wrapper }
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.getByTestId('pull-indicator')).toBeInTheDocument()
    })

    it('should trigger refresh when pulled down', async () => {
      const mockOnRefresh = vi.fn()

      render(
        <PullToRefresh onRefresh={mockOnRefresh}>
          <div>Content</div>
        </PullToRefresh>,
        { wrapper }
      )

      const container = screen.getByTestId('pull-to-refresh-container')

      // Simulate pull gesture
      fireEvent.touchStart(container, {
        touches: [{ clientY: 100 }],
      })

      fireEvent.touchMove(container, {
        touches: [{ clientY: 150 }], // Pulled down 50px
      })

      fireEvent.touchEnd(container, {
        changedTouches: [{ clientY: 150 }],
      })

      await waitFor(() => {
        expect(mockOnRefresh).toHaveBeenCalledTimes(1)
      })
    })

    it('should show loading state during refresh', async () => {
      let resolveRefresh: (value: void) => void
      const mockOnRefresh = vi.fn().mockImplementation(() => {
        return new Promise(resolve => {
          resolveRefresh = resolve
        })
      })

      render(
        <PullToRefresh onRefresh={mockOnRefresh}>
          <div>Content</div>
        </PullToRefresh>,
        { wrapper }
      )

      const container = screen.getByTestId('pull-to-refresh-container')

      // Trigger refresh
      fireEvent.touchStart(container, {
        touches: [{ clientY: 100 }],
      })

      fireEvent.touchMove(container, {
        touches: [{ clientY: 150 }],
      })

      fireEvent.touchEnd(container, {
        changedTouches: [{ clientY: 150 }],
      })

      await waitFor(() => {
        expect(screen.getByTestId('pull-spinner')).toBeInTheDocument()
      })

      // Complete refresh
      resolveRefresh!()

      await waitFor(() => {
        expect(screen.queryByTestId('pull-spinner')).not.toBeInTheDocument()
      })
    })

    it('should not trigger refresh for small pulls', async () => {
      const mockOnRefresh = vi.fn()

      render(
        <PullToRefresh onRefresh={mockOnRefresh} threshold={60}>
          <div>Content</div>
        </PullToRefresh>,
        { wrapper }
      )

      const container = screen.getByTestId('pull-to-refresh-container')

      // Pull less than threshold
      fireEvent.touchStart(container, {
        touches: [{ clientY: 100 }],
      })

      fireEvent.touchMove(container, {
        touches: [{ clientY: 130 }], // Only 30px pull
      })

      fireEvent.touchEnd(container, {
        changedTouches: [{ clientY: 130 }],
      })

      // Should not trigger refresh
      expect(mockOnRefresh).not.toHaveBeenCalled()
    })
  })

  describe('Cache Invalidation Integration', () => {
    it('should invalidate all relevant caches when refreshing dashboard', async () => {
      const mockInvalidate = {
        invalidateOrchard: vi.fn(),
        invalidateTrees: vi.fn(),
        invalidateActivityLogs: vi.fn(),
        invalidateDashboard: vi.fn(),
        invalidateAllOrchardData: vi.fn(),
      }

      mockOrchardHooks.useInvalidateOrchardData.mockReturnValue(mockInvalidate)

      render(
        <RefreshButton
          onClick={() => {
            mockInvalidate.invalidateAllOrchardData('orchard-1')
          }}
          label="รีเฟรช"
        />,
        { wrapper }
      )

      const button = screen.getByRole('button', { name: /รีเฟรช/i })
      fireEvent.click(button)

      expect(mockInvalidate.invalidateAllOrchardData).toHaveBeenCalledWith('orchard-1')
    })

    it('should refetch specific query when refreshing individual components', async () => {
      const mockRefetch = vi.fn().mockResolvedValue({ data: [] })

      mockOrchardHooks.useOrchardTrees.mockReturnValue({
        data: { trees: [], pagination: null },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      })

      const TreeListWithRefresh = () => {
        const { data, refetch } = mockOrchardHooks.useOrchardTrees('orchard-1')

        return (
          <div>
            <div data-testid="tree-count">{data?.trees?.length || 0}</div>
            <RefreshButton onClick={refetch} label="รีเฟรชรายการต้นไม้" />
          </div>
        )
      }

      render(<TreeListWithRefresh />, { wrapper })

      const button = screen.getByRole('button', { name: /รีเฟรชรายการต้นไม้/i })
      fireEvent.click(button)

      expect(mockRefetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <RefreshButton
          onClick={() => {}}
          label="รีเฟรชข้อมูล"
          aria-label="รีเฟรชข้อมูลล่าสุด"
        />,
        { wrapper }
      )

      const button = screen.getByRole('button', { name: /รีเฟรชข้อมูลล่าสุด/i })
      expect(button).toBeInTheDocument()
    })

    it('should support keyboard navigation', () => {
      const mockOnClick = vi.fn()

      render(
        <RefreshButton
          onClick={mockOnClick}
          label="รีเฟรช"
        />,
        { wrapper }
      )

      const button = screen.getByRole('button')

      // Tab to focus
      button.focus()
      expect(button).toHaveFocus()

      // Enter key
      fireEvent.keyDown(button, { key: 'Enter' })
      expect(mockOnClick).toHaveBeenCalledTimes(1)

      // Space key
      fireEvent.keyDown(button, { key: ' ' })
      expect(mockOnClick).toHaveBeenCalledTimes(2)
    })

    it('should announce refresh status to screen readers', async () => {
      const mockOnClick = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      render(
        <RefreshButton
          onClick={mockOnClick}
          label="รีเฟรช"
        />,
        { wrapper }
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      // Should have aria-live region for status updates
      await waitFor(() => {
        expect(screen.getByTestId('refresh-status')).toHaveAttribute('aria-live', 'polite')
      })
    })
  })
})