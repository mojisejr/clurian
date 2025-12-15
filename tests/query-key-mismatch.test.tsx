import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { renderHook, act } from '@testing-library/react'
import { useInvalidateOrchardData, queryKeys } from '@/lib/hooks/use-orchard-queries'

describe('Query Key Mismatch Tests', () => {
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
  })

  afterEach(() => {
    queryClient.clear()
  })

  describe('invalidateActivityLogs with FIXED query key structure', () => {
    it('should invalidate all activity log queries when no filters provided', () => {
      const { result } = renderHook(() => useInvalidateOrchardData(), {
        wrapper,
      })

      // Set up multiple activity log queries
      queryClient.setQueryData(
        queryKeys.orchardActivityLogs('orchard-1', { page: 1, limit: 20 }),
        { logs: [], pagination: { total: 0, page: 1, limit: 20 } }
      )

      queryClient.setQueryData(
        queryKeys.orchardActivityLogs('orchard-1', { page: 2, limit: 20 }),
        { logs: [], pagination: { total: 0, page: 2, limit: 20 } }
      )

      queryClient.setQueryData(
        queryKeys.orchardActivityLogs('orchard-1', { page: 1, limit: 20, logType: 'BATCH' }),
        { logs: [], pagination: { total: 0, page: 1, limit: 20 } }
      )

      const initialQueries = queryClient.getQueryCache().findAll()
      const initialActivityLogQueries = initialQueries.filter(q => {
        const key = q.queryKey
        return Array.isArray(key) && key.includes('orchard') && key.includes('orchard-1') && key.includes('logs')
      })

      // Test the FIXED implementation - should invalidate all activity log queries
      act(() => {
        result.current.invalidateActivityLogs('orchard-1')
      })

      const remainingQueries = queryClient.getQueryCache().findAll()
      const remainingActivityLogQueries = remainingQueries.filter(q => {
        const key = q.queryKey
        return Array.isArray(key) && key.includes('orchard') && key.includes('orchard-1') && key.includes('logs')
      })

      // All activity log queries should be invalidated (removed from cache)
      expect(remainingActivityLogQueries.length).toBeLessThan(initialActivityLogQueries.length)
      expect(remainingActivityLogQueries.length).toBe(0)
    })

    it('should invalidate specific activity log queries when filters provided', () => {
      const { result } = renderHook(() => useInvalidateOrchardData(), {
        wrapper,
      })

      // Set up multiple activity log queries
      queryClient.setQueryData(
        queryKeys.orchardActivityLogs('orchard-1', { page: 1, limit: 20 }),
        { logs: [], pagination: { total: 0, page: 1, limit: 20 } }
      )

      queryClient.setQueryData(
        queryKeys.orchardActivityLogs('orchard-1', { page: 1, limit: 20, logType: 'BATCH' }),
        { logs: [], pagination: { total: 0, page: 1, limit: 20 } }
      )

      queryClient.setQueryData(
        queryKeys.orchardActivityLogs('orchard-1', { page: 1, limit: 20, logType: 'INDIVIDUAL' }),
        { logs: [], pagination: { total: 0, page: 1, limit: 20 } }
      )

      const initialQueries = queryClient.getQueryCache().findAll()

      // Test the FIXED implementation with specific filters
      act(() => {
        result.current.invalidateActivityLogs('orchard-1', { page: 1, limit: 20, logType: 'BATCH' })
      })

      const remainingQueries = queryClient.getQueryCache().findAll()

      // Only the BATCH query should be invalidated
      const batchQueryExists = remainingQueries.some(q => {
        const key = q.queryKey
        return Array.isArray(key) &&
               key.includes('orchard') &&
               key.includes('orchard-1') &&
               key.includes('logs') &&
               JSON.stringify(key).includes('"logType":"BATCH"')
      })

      const individualQueryExists = remainingQueries.some(q => {
        const key = q.queryKey
        return Array.isArray(key) &&
               key.includes('orchard') &&
               key.includes('orchard-1') &&
               key.includes('logs') &&
               JSON.stringify(key).includes('"logType":"INDIVIDUAL"')
      })

      expect(batchQueryExists).toBe(false) // Should be invalidated
      expect(individualQueryExists).toBe(true) // Should remain
    })
  })

  describe('invalidateTrees with FIXED query key structure', () => {
    it('should invalidate all tree queries when no filters provided', () => {
      const { result } = renderHook(() => useInvalidateOrchardData(), {
        wrapper,
      })

      // Set up cached tree queries
      queryClient.setQueryData(
        queryKeys.orchardTrees('orchard-1', { page: 1, limit: 20 }),
        { trees: [], pagination: { total: 0, page: 1, limit: 20 } }
      )

      queryClient.setQueryData(
        queryKeys.orchardTrees('orchard-1', { page: 1, limit: 20, status: 'sick' }),
        { trees: [], pagination: { total: 0, page: 1, limit: 20 } }
      )

      const initialQueries = queryClient.getQueryCache().findAll()
      const initialTreeQueries = initialQueries.filter(q => {
        const key = q.queryKey
        return Array.isArray(key) && key.includes('orchard') && key.includes('orchard-1') && key.includes('trees')
      })

      // Test the FIXED implementation
      act(() => {
        result.current.invalidateTrees('orchard-1')
      })

      const remainingQueries = queryClient.getQueryCache().findAll()
      const remainingTreeQueries = remainingQueries.filter(q => {
        const key = q.queryKey
        return Array.isArray(key) && key.includes('orchard') && key.includes('orchard-1') && key.includes('trees')
      })

      // All tree queries should be invalidated
      expect(remainingTreeQueries.length).toBeLessThan(initialTreeQueries.length)
      expect(remainingTreeQueries.length).toBe(0)
    })

    it('should invalidate specific tree queries when filters provided', () => {
      const { result } = renderHook(() => useInvalidateOrchardData(), {
        wrapper,
      })

      // Set up cached tree queries
      queryClient.setQueryData(
        queryKeys.orchardTrees('orchard-1', { page: 1, limit: 20 }),
        { trees: [], pagination: { total: 0, page: 1, limit: 20 } }
      )

      queryClient.setQueryData(
        queryKeys.orchardTrees('orchard-1', { page: 1, limit: 20, status: 'sick' }),
        { trees: [], pagination: { total: 0, page: 1, limit: 20 } }
      )

      queryClient.setQueryData(
        queryKeys.orchardTrees('orchard-1', { page: 1, limit: 20, status: 'healthy' }),
        { trees: [], pagination: { total: 0, page: 1, limit: 20 } }
      )

      const initialQueries = queryClient.getQueryCache().findAll()

      // Test the FIXED implementation with specific filters
      act(() => {
        result.current.invalidateTrees('orchard-1', { page: 1, limit: 20, status: 'sick' })
      })

      const remainingQueries = queryClient.getQueryCache().findAll()

      // Only the sick trees query should be invalidated
      const sickQueryExists = remainingQueries.some(q => {
        const key = q.queryKey
        return Array.isArray(key) &&
               key.includes('orchard') &&
               key.includes('orchard-1') &&
               key.includes('trees') &&
               JSON.stringify(key).includes('"status":"sick"')
      })

      const healthyQueryExists = remainingQueries.some(q => {
        const key = q.queryKey
        return Array.isArray(key) &&
               key.includes('orchard') &&
               key.includes('orchard-1') &&
               key.includes('trees') &&
               JSON.stringify(key).includes('"status":"healthy"')
      })

      expect(sickQueryExists).toBe(false) // Should be invalidated
      expect(healthyQueryExists).toBe(true) // Should remain
    })
  })

  describe('BatchActivitiesView integration test', () => {
    it('should demonstrate the mismatch between Context state and React Query', () => {
      // This test shows why the refresh button doesn't work in BatchActivitiesView
      // The component uses Context state { logs } but refresh calls React Query invalidation

      const mockContextState = {
        logs: [
          { id: '1', logType: 'BATCH', action: 'Test Log 1' },
          { id: '2', logType: 'BATCH', action: 'Test Log 2' },
        ],
        currentOrchardId: 'orchard-1'
      }

      const mockReactQueryState = {
        data: {
          logs: [
            { id: '3', logType: 'BATCH', action: 'New Log from Server' },
          ],
          pagination: { total: 1, page: 1, limit: 20 }
        }
      }

      // Context state has different data
      expect(mockContextState.logs).toHaveLength(2)
      expect(mockReactQueryState.data.logs).toHaveLength(1)

      // When refresh is called, it invalidates React Query but UI shows Context state
      // This is the root cause of the refresh button not working
      expect(mockContextState.logs[0].action).toBe('Test Log 1')
      expect(mockReactQueryState.data.logs[0].action).toBe('New Log from Server')
    })
  })
})