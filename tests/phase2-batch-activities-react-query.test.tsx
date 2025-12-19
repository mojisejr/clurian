/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BatchActivitiesView } from '@/components/dashboard/views/batch-activities-view'
import { useOrchard } from '@/components/providers/orchard-provider'
import { useOrchardActivityLogs, useInvalidateOrchardData } from '@/lib/hooks/use-orchard-queries'

// Mock dependencies
vi.mock('@/components/providers/orchard-provider')
vi.mock('@/lib/hooks/use-orchard-queries')

const mockUseOrchard = useOrchard as any
const mockUseOrchardActivityLogs = useOrchardActivityLogs as any
const mockUseInvalidateOrchardData = useInvalidateOrchardData as any

describe('Phase 2: BatchActivitiesView React Query Migration', () => {
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

  describe('Phase 2: React Query Only Data Source', () => {
    it('should use only React Query for batch logs data', async () => {
      const mockLogsData = {
        logs: [
          {
            id: 'log-1',
            orchardId: 'orchard-1',
            logType: 'BATCH',
            targetZone: 'A',
            action: 'พ่นยาฆ่าแมลง',
            status: 'COMPLETED',
            performDate: '2025-12-15'
          },
          {
            id: 'log-2',
            orchardId: 'orchard-1',
            logType: 'BATCH',
            targetZone: 'B',
            action: 'ให้ปุ๋ย',
            status: 'IN_PROGRESS',
            followUpDate: '2025-12-20'
          }
        ]
      }

      mockUseOrchardActivityLogs.mockReturnValue({
        data: mockLogsData,
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

      render(<BatchActivitiesView onAddBatchLog={vi.fn()} />, { wrapper })

      // Verify React Query hook was called with correct filters
      expect(mockUseOrchardActivityLogs).toHaveBeenCalledWith('orchard-1', expect.objectContaining({
        filters: { logType: 'BATCH' }
      }))

      // Verify batch activities are displayed
      await waitFor(() => {
        expect(screen.getByText('พ่นยาฆ่าแมลง')).toBeInTheDocument()
        expect(screen.getByText('ให้ปุ๋ย')).toBeInTheDocument()
      })
    })

    it('should filter BATCH logType correctly at query level', async () => {
      mockUseOrchardActivityLogs.mockReturnValue({
        data: { logs: [] },
        isLoading: false,
        error: null
      })

      mockUseOrchard.mockReturnValue({
        currentOrchardId: 'orchard-1',
        updateLogs: vi.fn()
      })

      render(<BatchActivitiesView onAddBatchLog={vi.fn()} />, { wrapper })

      // Verify React Query hook was called with correct BATCH filter
      expect(mockUseOrchardActivityLogs).toHaveBeenCalledWith('orchard-1', expect.objectContaining({
        filters: { logType: 'BATCH' }
      }))

      // Should show empty state for batch activities
      expect(screen.getByText('ยังไม่มีบันทึกงานทั้งแปลง')).toBeInTheDocument()
    })

    it('should maintain all client-side filtering and sorting', async () => {
      const mockLogsData = {
        logs: [
          {
            id: 'log-1',
            orchardId: 'orchard-1',
            logType: 'BATCH',
            targetZone: 'A',
            action: 'งานเสร็จ',
            status: 'COMPLETED',
            performDate: '2025-12-14'
          },
          {
            id: 'log-2',
            orchardId: 'orchard-1',
            logType: 'BATCH',
            targetZone: 'B',
            action: 'งานรอติดตาม',
            status: 'IN_PROGRESS',
            performDate: '2025-12-15'
          }
        ]
      }

      mockUseOrchardActivityLogs.mockReturnValue({
        data: mockLogsData,
        isLoading: false,
        error: null
      })

      mockUseOrchard.mockReturnValue({
        currentOrchardId: 'orchard-1',
        updateLogs: vi.fn()
      })

      render(<BatchActivitiesView onAddBatchLog={vi.fn()} />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText('งานเสร็จ')).toBeInTheDocument()
        expect(screen.getByText('งานรอติดตาม')).toBeInTheDocument()
      })

      // Test status filter - "เสร็จสมบูรณ์"
      const completedFilter = screen.getByText('เสร็จสมบูรณ์')
      completedFilter.click()

      await waitFor(() => {
        expect(screen.getByText('งานเสร็จ')).toBeInTheDocument()
        expect(screen.queryByText('งานรอติดตาม')).not.toBeInTheDocument()
      })
    })

    it('should handle mutations through Context while using React Query for data', async () => {
      const mockUpdateLogs = vi.fn()

      mockUseOrchardActivityLogs.mockReturnValue({
        data: { logs: [] },
        isLoading: false,
        error: null
      })

      mockUseOrchard.mockReturnValue({
        currentOrchardId: 'orchard-1',
        updateLogs: mockUpdateLogs
      })

      render(<BatchActivitiesView onAddBatchLog={vi.fn()} />, { wrapper })

      // Verify Context is still used for mutations
      expect(mockUseOrchard).toHaveBeenCalled()
      expect(mockUseOrchardActivityLogs).toHaveBeenCalled()
    })

    it('should handle React Query loading and error states', async () => {
      // Test loading state
      mockUseOrchardActivityLogs.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null
      })

      mockUseOrchard.mockReturnValue({
        currentOrchardId: 'orchard-1',
        updateLogs: vi.fn()
      })

      render(<BatchActivitiesView onAddBatchLog={vi.fn()} />, { wrapper })

      expect(screen.getByText('กำลังโหลดข้อมูล...')).toBeInTheDocument()

      // Test error state
      mockUseOrchardActivityLogs.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch batch activities')
      })

      render(<BatchActivitiesView onAddBatchLog={vi.fn()} />, { wrapper })

      await waitFor(() => {
        expect(screen.getByText(/เกิดข้อผิดพลาดในการโหลดข้อมูล/)).toBeInTheDocument()
      })
    })
  })

  describe('Phase 2: Refresh Functionality', () => {
    it('should use React Query invalidation for refresh', async () => {
      const mockInvalidateActivityLogs = vi.fn()

      mockUseOrchardActivityLogs.mockReturnValue({
        data: { logs: [] },
        isLoading: false,
        error: null
      })

      mockUseOrchard.mockReturnValue({
        currentOrchardId: 'orchard-1',
        updateLogs: vi.fn()
      })

      mockUseInvalidateOrchardData.mockReturnValue({
        invalidateActivityLogs: mockInvalidateActivityLogs
      })

      render(<BatchActivitiesView onAddBatchLog={vi.fn()} />, { wrapper })

      // Click refresh button
      const refreshButton = screen.getByLabelText('รีเฟรชกิจกรรม')
      refreshButton.click()

      // Should call React Query invalidation
      expect(mockInvalidateActivityLogs).toHaveBeenCalledWith('orchard-1')
    })
  })
})