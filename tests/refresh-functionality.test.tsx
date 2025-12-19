import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RefreshButton } from '@/components/ui/refresh-button'

// Mock React Query hooks
const mockUseInvalidateOrchardData = vi.fn()
const mockUseOrchardData = vi.fn()
const mockUseOrchardTrees = vi.fn()

vi.mock('@/lib/hooks/use-orchard-queries', () => ({
  useInvalidateOrchardData: mockUseInvalidateOrchardData,
  useOrchardData: mockUseOrchardData,
  useOrchardTrees: mockUseOrchardTrees,
  useSpecificCacheInvalidation: vi.fn(() => ({
    invalidateSpecificTrees: vi.fn(),
  })),
}))

const mockOrchardHooks = {
  useInvalidateOrchardData: mockUseInvalidateOrchardData,
  useOrchardData: mockUseOrchardData,
  useOrchardTrees: mockUseOrchardTrees,
} as any // eslint-disable-line @typescript-eslint/no-explicit-any

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
      expect(button).toHaveAttribute('aria-label', 'ดึงข้อมูลล่าสุดจากเซิร์ฟเวอร์')
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