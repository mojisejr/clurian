"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getOrchards,
  getOrchardData,
  getOrchardDataLegacy,
  getOrchardTreesServer,
  getOrchardActivityLogsServer,
  getDashboardDataServer
} from '@/app/actions/orchards';

// Enhanced query cache configuration
export const CACHE_CONFIG = {
  // Static data - rarely changes
  ORCHARD: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  // Semi-static data - changes occasionally
  ORCHARD_DATA: {
    staleTime: 30 * 1000, // Reduced from 2 minutes to 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 15000),
  },
  // Dynamic data - changes frequently
  TREES: {
    staleTime: 45 * 1000, // Reduced from 1 minute to 45 seconds
    gcTime: 90 * 1000, // 1.5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
  },
  // Very dynamic data - real-time updates
  ACTIVITY_LOGS: {
    staleTime: 15 * 1000, // Reduced from 30 seconds to 15 seconds
    gcTime: 45 * 1000, // 45 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
    retryDelay: 1000,
  },
  // Dashboard data - needs to be fresh
  DASHBOARD: {
    staleTime: 20 * 1000, // Reduced from 30 seconds to 20 seconds
    gcTime: 60 * 1000, // 1 minute
    refetchInterval: 20 * 1000, // Reduced from 30 seconds to 20 seconds
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 5000),
  },
} as const;

// Optimized cache configuration for even fresher data
export const OPTIMIZED_CACHE_CONFIG = {
  ...CACHE_CONFIG,
  ORCHARD_DATA: {
    ...CACHE_CONFIG.ORCHARD_DATA,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },
  TREES: {
    ...CACHE_CONFIG.TREES,
    staleTime: 45 * 1000, // 45 seconds
    gcTime: 90 * 1000, // 1.5 minutes
  },
  ACTIVITY_LOGS: {
    ...CACHE_CONFIG.ACTIVITY_LOGS,
    staleTime: 15 * 1000, // 15 seconds
    gcTime: 45 * 1000, // 45 seconds
  },
  DASHBOARD: {
    ...CACHE_CONFIG.DASHBOARD,
    staleTime: 20 * 1000, // 20 seconds
    gcTime: 60 * 1000, // 1 minute
    refetchInterval: 20 * 1000, // 20 seconds
  },
} as const;

// Query key factory for consistent cache management
export const queryKeys = {
  // Base keys
  all: ['orchard'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...queryKeys.lists(), filters] as const,
  details: () => [...queryKeys.all, 'detail'] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,

  // Specific entity keys
  orchards: () => [...queryKeys.all, 'orchards'] as const,
  orchard: (orchardId: string) => [...queryKeys.details(), 'orchard', orchardId] as const,
  orchardData: (orchardId: string, options?: Record<string, unknown>) =>
    options
      ? [...queryKeys.detail(orchardId), 'data', options] as const
      : [...queryKeys.detail(orchardId), 'data'] as const,
  orchardTrees: (orchardId: string, filters?: Record<string, unknown>) =>
    filters
      ? [...queryKeys.detail(orchardId), 'trees', filters] as const
      : [...queryKeys.detail(orchardId), 'trees'] as const,
  orchardActivityLogs: (orchardId: string, filters?: Record<string, unknown>) =>
    filters
      ? [...queryKeys.detail(orchardId), 'logs', filters] as const
      : [...queryKeys.detail(orchardId), 'logs'] as const,
  dashboard: (orchardId: string, userId: string) =>
    [...queryKeys.detail(orchardId), 'dashboard', userId] as const,
} as const;

// Prefetching utilities
export function usePrefetchOrchardData() {
  const queryClient = useQueryClient();

  return {
    prefetchOrchard: (orchardId: string) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.orchard(orchardId),
        queryFn: () => getOrchardData(orchardId),
        ...CACHE_CONFIG.ORCHARD_DATA,
      });
    },
    prefetchTrees: (orchardId: string, page = 1, limit = 20, filters?: Record<string, unknown>) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.orchardTrees(orchardId, { page, limit, filters }),
        queryFn: () => getOrchardTreesServer(orchardId, page, limit, filters),
        ...CACHE_CONFIG.TREES,
      });
    },
    prefetchActivityLogs: (orchardId: string, page = 1, limit = 20, filters?: Record<string, unknown>) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.orchardActivityLogs(orchardId, { page, limit, filters }),
        queryFn: () => getOrchardActivityLogsServer(orchardId, page, limit, filters),
        ...CACHE_CONFIG.ACTIVITY_LOGS,
      });
    },
  };
}

// Cache invalidation utilities
export function useInvalidateOrchardData() {
  const queryClient = useQueryClient();

  return {
    invalidateOrchard: (orchardId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orchard(orchardId) });
    },
    invalidateOrchards: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orchards() });
    },
    invalidateOrchardData: (orchardId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orchardData(orchardId) });
    },
    invalidateTrees: (orchardId: string, filters?: Record<string, unknown>) => {
      // Invalidate specific tree queries with filters
      if (filters) {
        queryClient.invalidateQueries({ queryKey: queryKeys.orchardTrees(orchardId, filters) });
      } else {
        // Invalidate all tree queries for this orchard using predicate
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) &&
                   key.includes('orchard') &&
                   key.includes(orchardId) &&
                   key.includes('trees');
          }
        });
      }
      // Also invalidate orchard data since it includes trees
      queryClient.invalidateQueries({ queryKey: queryKeys.orchardData(orchardId) });
    },
    invalidateActivityLogs: (orchardId: string, filters?: Record<string, unknown>) => {
      // Invalidate specific activity log queries with filters
      if (filters) {
        queryClient.invalidateQueries({ queryKey: queryKeys.orchardActivityLogs(orchardId, filters) });
      } else {
        // Invalidate all activity log queries for this orchard using predicate
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) &&
                   key.includes('orchard') &&
                   key.includes(orchardId) &&
                   key.includes('logs');
          }
        });
      }
      // Also invalidate orchard data since it includes logs
      queryClient.invalidateQueries({ queryKey: queryKeys.orchardData(orchardId) });
    },
    invalidateDashboard: (orchardId: string, userId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(orchardId, userId) });
    },
    invalidateAllOrchardData: (orchardId: string) => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.includes('orchard') && key.includes(orchardId);
        }
      });
    },
  };
}

// Enhanced cache invalidation with tag-based strategy
export function useEnhancedInvalidateOrchardData() {
  const queryClient = useQueryClient();

  // Cache tag generation
  const generateTags = {
    orchard: (orchardId: string) => `orchard-${orchardId}`,
    trees: (orchardId: string) => `trees-${orchardId}`,
    logs: (orchardId: string) => `logs-${orchardId}`,
    dashboard: (orchardId: string, userId: string) => `dashboard-${orchardId}-${userId}`,
    global: 'orchard-list' as const,
  };

  // Invalidate by tag (simulated - React Query doesn't have native tag support)
  const invalidateByTag = (tag: string) => {
    // This simulates tag-based invalidation
    // In a real implementation, you might use a different caching strategy
    console.log(`[Cache] Invalidating tag: ${tag}`);

    if (tag.startsWith('orchard-')) {
      const orchardId = tag.replace('orchard-', '');
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.includes(orchardId);
        }
      });
    } else if (tag === 'orchard-list') {
      queryClient.invalidateQueries({ queryKey: queryKeys.orchards() });
    }
  };

  return {
    // Enhanced invalidation methods
    invalidateOrchardData: (orchardId: string) => {
      const tags = [
        generateTags.orchard(orchardId),
        generateTags.trees(orchardId),
        generateTags.logs(orchardId),
      ];
      tags.forEach(invalidateByTag);
    },

    invalidateTrees: (orchardId: string) => {
      invalidateByTag(generateTags.trees(orchardId));
      // Also invalidate the orchard data since trees are part of it
      invalidateByTag(generateTags.orchard(orchardId));
    },

    invalidateActivityLogs: (orchardId: string) => {
      invalidateByTag(generateTags.logs(orchardId));
      // Also invalidate the orchard data since logs are part of it
      invalidateByTag(generateTags.orchard(orchardId));
    },

    invalidateDashboard: (orchardId: string, userId: string) => {
      invalidateByTag(generateTags.dashboard(orchardId, userId));
      // Also invalidate orchard data since dashboard stats depend on it
      invalidateByTag(generateTags.orchard(orchardId));
    },

    invalidateAllOrchardData: (orchardId: string) => {
      const tags = [
        generateTags.orchard(orchardId),
        generateTags.trees(orchardId),
        generateTags.logs(orchardId),
      ];
      tags.forEach(invalidateByTag);
    },

    invalidateGlobal: () => {
      invalidateByTag(generateTags.global);
    },

    // Export tag generators for use in server actions
    generateTags,
  };
}

// Optimistic update utilities
export function useOptimisticOrchardUpdates() {
  const queryClient = useQueryClient();

  return {
    updateTreeOptimistically: (orchardId: string, treeId: string, updates: Record<string, unknown>) => {
      // Cancel any outgoing refetches
      queryClient.cancelQueries({ queryKey: queryKeys.orchardTrees(orchardId) });

      // Snapshot the previous value
      const previousTrees = queryClient.getQueryData(queryKeys.orchardTrees(orchardId));

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.orchardTrees(orchardId), (old: unknown) => {
        if (!old || typeof old !== 'object' || !('trees' in old)) return old;
        const oldData = old as { trees: Array<{ id: string } & Record<string, unknown>> };
        return {
          ...oldData,
          trees: oldData.trees.map((tree) =>
            tree.id === treeId ? { ...tree, ...updates } : tree
          ),
        };
      });

      // Return a context object with the snapshotted value
      return { previousTrees };
    },
    rollbackTreeUpdate: (orchardId: string, context: { previousTrees?: unknown }) => {
      queryClient.setQueryData(queryKeys.orchardTrees(orchardId), context.previousTrees);
    },
  };
}

// Custom hooks for data fetching with enhanced caching
export function useOrchards() {
  return useQuery({
    queryKey: queryKeys.orchards(),
    queryFn: getOrchards,
    ...CACHE_CONFIG.ORCHARD,
    // Keep previous data while fetching for better UX
    placeholderData: (previousData) => previousData,
  });
}

export function useOrchardData(
  orchardId: string,
  options?: {
    page?: number;
    limit?: number;
    filters?: {
      zone?: string;
      status?: string;
      searchTerm?: string;
    };
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: queryKeys.orchardData(orchardId, options),
    queryFn: () => getOrchardData(orchardId, options),
    enabled: !!orchardId && (options?.enabled ?? true),
    ...CACHE_CONFIG.ORCHARD_DATA,
    // Keep previous data while fetching new data for better UX
    placeholderData: (previousData) => previousData,
    // Add error boundary behavior
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = error.status as number;
        if (status >= 400 && status < 500) return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Legacy compatibility hook for backward compatibility
 * @deprecated Use useOrchardData with options object instead
 */
export function useOrchardDataLegacy(
  orchardId: string,
  page: number = 1,
  limit: number = 100
) {
  return useQuery({
    queryKey: [...queryKeys.orchardData(orchardId), { page, limit }],
    queryFn: () => getOrchardDataLegacy(orchardId, page, limit),
    enabled: !!orchardId,
    ...CACHE_CONFIG.ORCHARD_DATA,
  });
}

export function useOrchardTrees(
  orchardId: string,
  options: {
    page?: number;
    limit?: number;
    filters?: {
      status?: string;
      zone?: string;
      searchTerm?: string;
    };
    enabled?: boolean;
  } = {}
) {
  const { page = 1, limit = 20, filters = {}, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.orchardTrees(orchardId, { page, limit, filters }),
    queryFn: () => getOrchardTreesServer(orchardId, page, limit, filters),
    enabled: !!orchardId && enabled,
    ...CACHE_CONFIG.TREES,
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
  });
}

export function useOrchardActivityLogs(
  orchardId: string,
  options: {
    page?: number;
    limit?: number;
    filters?: {
      logType?: string;
      zone?: string;
      dateFrom?: string;
      dateTo?: string;
    };
    enabled?: boolean;
  } = {}
) {
  const { page = 1, limit = 20, filters = {}, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.orchardActivityLogs(orchardId, { page, limit, filters }),
    queryFn: () => getOrchardActivityLogsServer(orchardId, page, limit, filters),
    enabled: !!orchardId && enabled,
    ...CACHE_CONFIG.ACTIVITY_LOGS,
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
  });
}

export function useDashboardData(orchardId: string, userId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.dashboard(orchardId, userId),
    queryFn: () => getDashboardDataServer(orchardId, userId),
    enabled: !!orchardId && !!userId && (options.enabled ?? true),
    ...CACHE_CONFIG.DASHBOARD,
    // Add network status awareness
    networkMode: 'online',
  });
}

// Specialized hooks for common use cases
export function useOrchardStats(orchardId: string) {
  return useQuery({
    queryKey: [...queryKeys.orchardData(orchardId), 'stats'],
    queryFn: async () => {
      const data = await getOrchardData(orchardId, { limit: 1 });
      return {
        totalTrees: data.pagination?.total || 0,
        healthyTrees: data.trees?.filter(t => t.status === 'healthy').length || 0,
        sickTrees: data.trees?.filter(t => t.status === 'sick').length || 0,
        deadTrees: data.trees?.filter(t => t.status === 'dead').length || 0,
      };
    },
    enabled: !!orchardId,
    ...CACHE_CONFIG.ORCHARD_DATA,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}

export function useRecentActivityLogs(orchardId: string, limit = 10) {
  return useQuery({
    queryKey: [...queryKeys.orchardActivityLogs(orchardId), 'recent', limit],
    queryFn: () => getOrchardActivityLogsServer(orchardId, 1, limit),
    enabled: !!orchardId,
    ...CACHE_CONFIG.ACTIVITY_LOGS,
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

/**
 * Hook for specific cache invalidation that doesn't trigger orchard-wide refetching
 * This prevents the orchard switching overlay from appearing during refresh
 */
export function useSpecificCacheInvalidation() {
  const queryClient = useQueryClient();

  return {
    invalidateSpecificTrees: (orchardId: string, filters?: Record<string, unknown>) => {
      // Invalidate ONLY trees queries without affecting orchardData
      if (filters) {
        queryClient.invalidateQueries({ queryKey: queryKeys.orchardTrees(orchardId, filters) });
      } else {
        // Invalidate all tree queries for this orchard using predicate
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) &&
                   key.includes('orchard') &&
                   key.includes(orchardId) &&
                   key.includes('trees');
          }
        });
      }
      // NOTE: We do NOT invalidate orchardData here to avoid triggering the overlay
    },
    invalidateSpecificActivityLogs: (orchardId: string, filters?: Record<string, unknown>) => {
      // Invalidate ONLY activity logs queries without affecting orchardData
      if (filters) {
        queryClient.invalidateQueries({ queryKey: queryKeys.orchardActivityLogs(orchardId, filters) });
      } else {
        // Invalidate all activity log queries for this orchard using predicate
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) &&
                   key.includes('orchard') &&
                   key.includes(orchardId) &&
                   key.includes('logs');
          }
        });
      }
      // NOTE: We do NOT invalidate orchardData here to avoid triggering the overlay
    },
    invalidateSpecificDashboard: (orchardId: string, userId: string) => {
      // Invalidate ONLY dashboard stats without affecting orchardData
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(orchardId, userId) });
    }
  };
}