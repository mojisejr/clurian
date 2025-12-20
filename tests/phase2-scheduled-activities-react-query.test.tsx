/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ScheduledActivitiesView } from '@/components/dashboard/views/scheduled-activities-view'
import { useOrchard } from '@/components/providers/orchard-provider'
import { useOrchardActivityLogs, useOrchardTrees, useInvalidateOrchardData } from '@/lib/hooks/use-orchard-queries'

// Mock dependencies
vi.mock('@/components/providers/orchard-provider')
vi.mock('@/lib/hooks/use-orchard-queries')

const mockUseOrchard = useOrchard as any
const mockUseOrchardActivityLogs = useOrchardActivityLogs as any
const mockUseOrchardTrees = useOrchardTrees as any
const mockUseInvalidateOrchardData = useInvalidateOrchardData as any

describe('Phase 2: ScheduledActivitiesView React Query Migration', () => {
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
  })

  describe('Phase 2: React Query Data Integration', () => {
    it('should use React Query hooks for logs and trees data', async () => {
      // Mock logs data with follow-up dates
      const mockLogsData = {
        logs: [
          {
            id: 'log-1',
            orchardId: 'orchard-1',
            logType: 'INDIVIDUAL',
            treeId: 'tree-1',
            action: 'ให้ยา',
            status: 'IN_PROGRESS',
            followUpDate: '2025-12-20'
          },
          {
            id: 'log-2',
            orchardId: 'orchard-1',
            logType: 'BATCH',
            targetZone: 'A',
            action: 'พ่นยา',
            status: 'IN_PROGRESS',
            followUpDate: '2025-12-18'
          }
        ]
      }

      // Mock trees data for zone info
      const mockTreesData = {
        trees: [
          { id: 'tree-1', code: 'T001', zone: 'A' },
          { id: 'tree-2', code: 'T002', zone: 'B' }
        ]
      }

      mockUseOrchardActivityLogs.mockReturnValue({
        data: mockLogsData,
        isLoading: false,
        error: null
      })

      mockUseOrchardTrees.mockReturnValue({
        data: mockTreesData,
        isLoading: false,
        error: null
      })

      // Context should only provide mutations
      mockUseOrchard.mockReturnValue({
        currentOrchardId: 'orchard-1',
        updateLogs: vi.fn()
      })

      mockUseInvalidateOrchardData.mockReturnValue({
        invalidateActivityLogs: vi.fn()
      })

      render(<ScheduledActivitiesView />, { wrapper })

      // Verify React Query hooks were called
      expect(mockUseOrchardActivityLogs).toHaveBeenCalledWith('orchard-1', expect.any(Object))
      expect(mockUseOrchardTrees).toHaveBeenCalledWith('orchard-1', expect.any(Object))

      // Verify activities are displayed
      await waitFor(() => {
        expect(screen.getByText('ให้ยา')).toBeInTheDocument()
        expect(screen.getByText('พ่นยา')).toBeInTheDocument()
      })
    })

    it('should filter logs with follow-up dates correctly', async () => {
      const mockLogsData = {
        logs: [
          // Should be included - has followUpDate and IN_PROGRESS
          {
            id: 'log-1',
            orchardId: 'orchard-1',
            action: 'งานที่ต้องทำ',
            status: 'IN_PROGRESS',
            followUpDate: '2025-12-20'
          },
          // Should be excluded - no followUpDate
          {
            id: 'log-2',
            orchardId: 'orchard-1',
            action: 'งานเสร็จแล้ว',
            status: 'COMPLETED'
          },
          // Should be excluded - COMPLETED status even with followUpDate
          {
            id: 'log-3',
            orchardId: 'orchard-1',
            action: 'งานเสร็จแล้วมีนัด',
            status: 'COMPLETED',
            followUpDate: '2025-12-20'
          }
        ]
      }

      mockUseOrchardActivityLogs.mockReturnValue({
        data: mockLogsData,
        isLoading: false,
        error: null
      })

      mockUseOrchardTrees.mockReturnValue({
        data: { trees: [] },
        isLoading: false,
        error: null
      })

      mockUseOrchard.mockReturnValue({
        currentOrchardId: 'orchard-1',
        updateLogs: vi.fn()
      })

      render(<ScheduledActivitiesView />, { wrapper })

      await waitFor(() => {
        // Should only show the IN_PROGRESS log with followUpDate
        expect(screen.getByText('งานที่ต้องทำ')).toBeInTheDocument()
        expect(screen.queryByText('งานเสร็จแล้ว')).not.toBeInTheDocument()
        expect(screen.queryByText('งานเสร็จแล้วมีนัด')).not.toBeInTheDocument()
      })
    })

    it('should maintain search and filter functionality with React Query data', async () => {
      const mockLogsData = {
        logs: [
          {
            id: 'log-1',
            orchardId: 'orchard-1',
            logType: 'BATCH',
            targetZone: 'A',
            action: 'พ่นยาโซน A',
            status: 'IN_PROGRESS',
            followUpDate: '2025-12-20'
          },
          {
            id: 'log-2',
            orchardId: 'orchard-1',
            logType: 'BATCH',
            targetZone: 'B',
            action: 'พ่นยาโซน B',
            status: 'IN_PROGRESS',
            followUpDate: '2025-12-21'
          }
        ]
      }

      mockUseOrchardActivityLogs.mockReturnValue({
        data: mockLogsData,
        isLoading: false,
        error: null
      })

      mockUseOrchardTrees.mockReturnValue({
        data: { trees: [] },
        isLoading: false,
        error: null
      })

      mockUseOrchard.mockReturnValue({
        currentOrchardId: 'orchard-1',
        updateLogs: vi.fn()
      })

      render(<ScheduledActivitiesView />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('พ่นยาโซน A')).toBeInTheDocument()
        expect(screen.getByText('พ่นยาโซน B')).toBeInTheDocument()
      })

      // Test search functionality
      const searchInput = screen.getByPlaceholderText('ค้นหา...')
      searchInput.value = 'โซน A'
      searchInput.dispatchEvent(new Event('change', { bubbles: true }))

      await waitFor(() => {
        expect(screen.getByText('พ่นยาโซน A')).toBeInTheDocument()
        expect(screen.queryByText('พ่นยาโซน B')).not.toBeInTheDocument()
      })
    })

    it('should handle loading and error states from React Query', async () => {
      // Test loading state
      mockUseOrchardActivityLogs.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null
      })

      mockUseOrchardTrees.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null
      })

      mockUseOrchard.mockReturnValue({
        currentOrchardId: 'orchard-1',
        updateLogs: vi.fn()
      })

      render(<ScheduledActivitiesView />, { wrapper })

      // Should show loading state
      expect(screen.getByText('กำลังโหลดข้อมูล...')).toBeInTheDocument()

      // Test error state
      mockUseOrchardActivityLogs.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch logs')
      })

      render(<ScheduledActivitiesView />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText(/เกิดข้อผิดพลาด/)).toBeInTheDocument()
      })
    })
  })

  describe('Phase 2: Context Independence Tests', () => {
    it('should work without Context data provision', async () => {
      mockUseOrchardActivityLogs.mockReturnValue({
        data: { logs: [] },
        isLoading: false,
        error: null
      })

      mockUseOrchardTrees.mockReturnValue({
        data: { trees: [] },
        isLoading: false,
        error: null
      })

      // Context provides only mutations, no data
      mockUseOrchard.mockReturnValue({
        currentOrchardId: 'orchard-1',
        updateLogs: vi.fn()
        // No logs, trees, or other data from Context
      })

      render(<ScheduledActivitiesView />, { wrapper })

      // Should render without errors despite no Context data
      await waitFor(() => {
        expect(screen.getByText('ไม่มีงานที่ต้องทำ')).toBeInTheDocument()
      })

      // Verify React Query hooks are used
      expect(mockUseOrchardActivityLogs).toHaveBeenCalled()
      expect(mockUseOrchardTrees).toHaveBeenCalled()
    })
  })
})