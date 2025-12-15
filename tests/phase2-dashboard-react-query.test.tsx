import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DashboardView } from '@/components/dashboard/views/dashboard-view'
import { useOrchard } from '@/components/providers/orchard-provider'
import { useOrchardTrees, useInvalidateOrchardData } from '@/lib/hooks/use-orchard-queries'

// Mock dependencies
vi.mock('@/components/providers/orchard-provider')
vi.mock('@/lib/hooks/use-orchard-queries')

const mockUseOrchard = useOrchard as any
const mockUseOrchardTrees = useOrchardTrees as any
const mockUseInvalidateOrchardData = useInvalidateOrchardData as any

describe('Phase 2: DashboardView React Query Migration', () => {
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

    // Reset mocks
    vi.clearAllMocks()
  })

  describe('Phase 2: React Query Integration Tests', () => {
    it('should use React Query hooks instead of Context for tree data', async () => {
      // Mock React Query hook data
      const mockTreesData = {
        trees: [
          { id: 'tree-1', code: 'T001', status: 'healthy', zone: 'A' },
          { id: 'tree-2', code: 'T002', status: 'sick', zone: 'B' }
        ],
        pagination: { total: 2, page: 1, totalPages: 1 }
      }

      mockUseOrchardTrees.mockReturnValue({
        data: mockTreesData,
        isLoading: false,
        error: null
      })

      // Mock Context mutations only (no data)
      mockUseOrchard.mockReturnValue({
        currentOrchardId: 'orchard-1',
        currentOrchard: { id: 'orchard-1', name: 'Test Orchard', zones: ['A', 'B'] },
        addTree: vi.fn(),
        updateTree: vi.fn()
      })

      mockUseInvalidateOrchardData.mockReturnValue({
        invalidateTrees: vi.fn()
      })

      render(<DashboardView
        onViewChange={vi.fn()}
        onIdentifyTree={vi.fn()}
        loadingTreeId={null}
      />, { wrapper })

      // Verify React Query hook was called
      expect(mockUseOrchardTrees).toHaveBeenCalledWith('orchard-1', expect.objectContaining({
        page: expect.any(Number),
        filters: expect.objectContaining({})
      }))

      // Verify tree data from React Query is displayed
      await waitFor(() => {
        expect(screen.getByText('T001')).toBeInTheDocument()
        expect(screen.getByText('T002')).toBeInTheDocument()
      })
    })

    it('should maintain all existing functionality after migration', async () => {
      const mockTreesData = {
        trees: [{ id: 'tree-1', code: 'T001', status: 'healthy', zone: 'A' }],
        pagination: { total: 1, page: 1, totalPages: 1 }
      }

      mockUseOrchardTrees.mockReturnValue({
        data: mockTreesData,
        isLoading: false,
        error: null
      })

      const mockAddTree = vi.fn()
      mockUseOrchard.mockReturnValue({
        currentOrchardId: 'orchard-1',
        currentOrchard: { id: 'orchard-1', name: 'Test Orchard', zones: ['A', 'B'] },
        addTree: mockAddTree,
        updateTree: vi.fn()
      })

      const mockOnViewChange = vi.fn()
      render(<DashboardView
        onViewChange={mockOnViewChange}
        onIdentifyTree={vi.fn()}
        loadingTreeId={null}
      />, { wrapper })

      // Test add tree functionality
      const addButton = screen.getByText(/ลงทะเบียนต้นใหม่/)
      expect(addButton).toBeInTheDocument()

      // Test filters exist
      expect(screen.getByPlaceholderText(/ค้นหาเลขต้นหรือพันธุ์.../)).toBeInTheDocument()
    })

    it('should handle loading states from React Query', async () => {
      mockUseOrchardTrees.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null
      })

      mockUseOrchard.mockReturnValue({
        currentOrchardId: 'orchard-1',
        addTree: vi.fn(),
        updateTree: vi.fn()
      })

      render(<DashboardView
        onViewChange={vi.fn()}
        onIdentifyTree={vi.fn()}
        loadingTreeId={null}
      />, { wrapper })

      // Should show loading skeleton components (TreeCardSkeleton)
      const skeletonCards = screen.getAllByRole('generic').filter(el =>
        el.className.includes('animate-pulse')
      )
      expect(skeletonCards.length).toBeGreaterThan(0)
    })

    it('should handle error states from React Query', async () => {
      mockUseOrchardTrees.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch trees')
      })

      mockUseOrchard.mockReturnValue({
        currentOrchardId: 'orchard-1',
        addTree: vi.fn(),
        updateTree: vi.fn()
      })

      render(<DashboardView
        onViewChange={vi.fn()}
        onIdentifyTree={vi.fn()}
        loadingTreeId={null}
      />, { wrapper })

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText(/เกิดข้อผิดพลาด/)).toBeInTheDocument()
      })
    })
  })

  describe('Phase 2: Context API Cleanup Tests', () => {
    it('should not rely on Context for data fetching', async () => {
      const mockTreesData = {
        trees: [],
        pagination: { total: 0, page: 1, totalPages: 1 }
      }

      mockUseOrchardTrees.mockReturnValue({
        data: mockTreesData,
        isLoading: false,
        error: null
      })

      // Context should only provide mutations, not data
      mockUseOrchard.mockReturnValue({
        currentOrchardId: 'orchard-1',
        currentOrchard: { id: 'orchard-1', name: 'Test Orchard', zones: ['A'] },
        addTree: vi.fn(),
        updateTree: vi.fn()
        // NO trees, logs, pagination, or filter state
      })

      render(<DashboardView
        onViewChange={vi.fn()}
        onIdentifyTree={vi.fn()}
        loadingTreeId={null}
      />, { wrapper })

      // Verify React Query is used instead
      expect(mockUseOrchardTrees).toHaveBeenCalled()

      // Verify React Query is used for trees data
      expect(mockUseOrchardTrees).toHaveBeenCalledWith('orchard-1', expect.any(Object))

      // Verify that the component renders without trees data from Context
      // (Context is only called for mutations and orchard info, not data)
      expect(mockUseOrchard).toHaveBeenCalled()
    })
  })
})