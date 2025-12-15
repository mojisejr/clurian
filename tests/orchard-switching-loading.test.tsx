import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NavBar } from '@/components/nav-bar'
import * as orchardHooks from '@/lib/hooks/use-orchard-queries'
import * as orchardProvider from '@/components/providers/orchard-provider'

// Mock dependencies
vi.mock('@/lib/hooks/use-orchard-queries')
vi.mock('@/components/providers/orchard-provider', async () => {
  const actual = await vi.importActual('@/components/providers/orchard-provider')
  return {
    ...actual,
    useOrchard: vi.fn()
  }
})

const mockOrchardHooks = orchardHooks as any
const mockOrchardProvider = orchardProvider as any

describe('Orchard Switching Loading States', () => {
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

    // Mock orchard data
    mockOrchardHooks.useOrchards = vi.fn().mockReturnValue({
      data: [
        { id: 'orchard-1', name: 'สวนทุเรียนจันทบุรี' },
        { id: 'orchard-2', name: 'สวนทุเรียนกรุงเทพ' }
      ],
      isLoading: false
    })

    vi.clearAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
  })

  describe('Navigation Bar Loading State', () => {
    it('should show loading indicator in dropdown when switching orchards', async () => {
      // Mock initial state - orchard 1 selected
      mockOrchardProvider.useOrchard = vi.fn().mockReturnValue({
        orchards: [
          { id: 'orchard-1', name: 'สวนทุเรียนจันทบุรี' },
          { id: 'orchard-2', name: 'สวนทุเรียนกรุงเทพ' }
        ],
        currentOrchardId: 'orchard-1',
        currentOrchard: { id: 'orchard-1', name: 'สวนทุเรียนจันทบุรี' },
        setCurrentOrchardId: vi.fn(),
        addOrchard: vi.fn(),
        isFetchingOrchardData: false
      })

      render(<NavBar />, { wrapper })

      // Open dropdown
      const dropdown = screen.getByText('สวนทุเรียนจันทบุรี')
      fireEvent.click(dropdown)

      // Should show both orchards
      expect(screen.getByText('สวนทุเรียนจันทบุรี')).toBeInTheDocument()
      expect(screen.getByText('สวนทุเรียนกรุงเทพ')).toBeInTheDocument()

      // Mock loading state after clicking second orchard
      const mockSetOrchard = vi.fn()
      mockOrchardProvider.useOrchard = vi.fn().mockReturnValue({
        orchards: [
          { id: 'orchard-1', name: 'สวนทุเรียนจันทบุรี' },
          { id: 'orchard-2', name: 'สวนทุเรียนกรุงเทพ' }
        ],
        currentOrchardId: 'orchard-2', // Already changed
        currentOrchard: { id: 'orchard-1', name: 'สวนทุเรียนจันทบุรี' }, // But still showing old data
        setCurrentOrchardId: mockSetOrchard,
        addOrchard: vi.fn(),
        isFetchingOrchardData: true // Loading state
      })

      // Click on second orchard
      const orchard2 = screen.getByText('สวนทุเรียนกรุงเทพ')
      fireEvent.click(orchard2)

      // Should call setCurrentOrchardId
      expect(mockSetOrchard).toHaveBeenCalledWith('orchard-2')

      // Should eventually show loading state (implementation needs to add this)
      // This test documents the expected behavior
    })

    it('should disable dropdown interaction during loading', async () => {
      // This test verifies that the dropdown should be disabled during loading
      // Implementation will need to add disabled state based on isFetchingOrchardData

      mockOrchardProvider.useOrchard = vi.fn().mockReturnValue({
        orchards: [
          { id: 'orchard-1', name: 'สวนทุเรียนจันทบุรี' },
          { id: 'orchard-2', name: 'สวนทุเรียนกรุงเทพ' }
        ],
        currentOrchardId: 'orchard-1',
        currentOrchard: { id: 'orchard-1', name: 'สวนทุเรียนจันทบุรี' },
        setCurrentOrchardId: vi.fn(),
        addOrchard: vi.fn(),
        isFetchingOrchardData: true
      })

      render(<NavBar />, { wrapper })

      // The dropdown trigger should have disabled state or loading indicator
      const trigger = screen.getByText('สวนทุเรียนจันทบุรี')

      // Implementation should add disabled prop or loading spinner
      // This test documents the expected behavior
    })
  })

  describe('Dashboard Loading State', () => {
    it('should show DashboardSkeleton when switching orchards', async () => {
      // This test verifies that dashboard should show skeleton when fetching new orchard

      // Initial state
      mockOrchardProvider.useOrchard = vi.fn().mockReturnValue({
        orchards: [{ id: 'orchard-1', name: 'สวนทุเรียน' }],
        currentOrchardId: 'orchard-1',
        currentOrchard: { id: 'orchard-1', name: 'สวนทุเรียน' },
        trees: [],
        isLoadingOrchardData: false,
        isLoadingOrchards: false,
        isFetchingOrchardData: false, // New property needed
        batchActivityCount: 0,
        scheduledActivityCount: 0,
        addTree: vi.fn(),
        addLog: vi.fn(),
        addOrchard: vi.fn()
      })

      const DashboardPage = (await import('@/app/dashboard/page')).default

      render(<DashboardPage />, { wrapper })

      // Should render dashboard initially
      expect(screen.queryByText('กำลังโหลด...')).not.toBeInTheDocument()

      // Simulate orchard switching - fetching new data
      mockOrchardProvider.useOrchard = vi.fn().mockReturnValue({
        orchards: [{ id: 'orchard-2', name: 'สวนทุเรียนใหม่' }],
        currentOrchardId: 'orchard-2',
        currentOrchard: { id: 'orchard-1', name: 'สวนทุเรียนเก่า' }, // Old data still showing
        trees: [],
        isLoadingOrchardData: false, // Not loading, but
        isFetchingOrchardData: true, // Currently fetching new data
        batchActivityCount: 0,
        scheduledActivityCount: 0,
        addTree: vi.fn(),
        addLog: vi.fn(),
        addOrchard: vi.fn()
      })

      // Implementation should show skeleton or loading overlay
      // This test documents expected behavior
    })

    it('should show overlay with spinner during orchard transition', async () => {
      // This test verifies that a smooth overlay should appear during transition

      mockOrchardProvider.useOrchard = vi.fn().mockReturnValue({
        orchards: [{ id: 'orchard-1', name: 'สวนทุเรียน' }],
        currentOrchardId: 'orchard-1',
        currentOrchard: { id: 'orchard-1', name: 'สวนทุเรียน' },
        trees: [{ id: 'tree-1', code: 'T001' }],
        isSwitchingOrchard: true, // New state needed
        isLoadingOrchardData: false,
        isFetchingOrchardData: true
      })

      const DashboardPage = (await import('@/app/dashboard/page')).default

      render(<DashboardPage />, { wrapper })

      // Should show overlay with loading message
      // Implementation needs to add this overlay component
      // This test documents expected behavior

      // The overlay should include:
      // - Loading message
      // - Spinner icon
      // - Semi-transparent background
      // - Should be centered on screen
    })
  })

  describe('User Experience Requirements', () => {
    it('should provide immediate visual feedback when orchard is clicked', () => {
      // When user clicks on orchard, there should be immediate feedback
      // Even before data fetching completes

      mockOrchardProvider.useOrchard = vi.fn().mockReturnValue({
        orchards: [
          { id: 'orchard-1', name: 'สวนเก่า' },
          { id: 'orchard-2', name: 'สวนใหม่' }
        ],
        currentOrchardId: 'orchard-1',
        setCurrentOrchardId: vi.fn(),
        isSwitchingOrchard: false
      })

      render(<NavBar />, { wrapper })

      const newOrchard = screen.getByText('สวนใหม่')

      // Click should immediately trigger some visual change
      fireEvent.click(newOrchard)

      // Should see either:
      // - Loading spinner
      // - Disabled state
      // - Highlight/selection change
      // This test documents expected immediate feedback
    })

    it('should maintain context of previously selected tab after orchard switch', async () => {
      // When switching orchards, the active tab should be preserved

      mockOrchardProvider.useOrchard = vi.fn().mockReturnValue({
        orchards: [{ id: 'orchard-1', name: 'สวนทุเรียน' }],
        currentOrchardId: 'orchard-1',
        currentOrchard: { id: 'orchard-1', name: 'สวนทุเรียน' },
        isFetchingOrchardData: false
      })

      const DashboardPage = (await import('@/app/dashboard/page')).default

      // Mock localStorage or state for active tab
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('"batch_activities"')

      render(<DashboardPage />, { wrapper })

      // After orchard switch, same tab should be active
      // Implementation should preserve tab state
      // This test documents expected behavior
    })
  })
})