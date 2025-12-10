"use client";

import { useQuery } from '@tanstack/react-query';
import {
  getOrchards,
  getOrchardData,
  getOrchardTreesServer,
  getOrchardActivityLogsServer,
  getDashboardDataServer
} from '@/app/actions/orchard';

// Query keys for consistent cache management
export const queryKeys = {
  orchards: ['orchards'] as const,
  orchard: (orchardId: string) => ['orchard', orchardId] as const,
  orchardData: (orchardId: string) => ['orchardData', orchardId] as const,
  orchardTrees: (orchardId: string, filters?: Record<string, unknown>) =>
    filters ? ['orchardTrees', orchardId, filters] as const : ['orchardTrees', orchardId] as const,
  orchardActivityLogs: (orchardId: string, filters?: Record<string, unknown>) =>
    filters ? ['orchardActivityLogs', orchardId, filters] as const : ['orchardActivityLogs', orchardId] as const,
  dashboard: (orchardId: string, userId: string) => ['dashboard', orchardId, userId] as const,
};

// Custom hooks for data fetching
export function useOrchards() {
  return useQuery({
    queryKey: queryKeys.orchards,
    queryFn: getOrchards,
    staleTime: 10 * 60 * 1000, // 10 minutes - orchards rarely change
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
  });
}

export function useOrchardData(orchardId: string) {
  return useQuery({
    queryKey: queryKeys.orchardData(orchardId),
    queryFn: () => getOrchardData(orchardId),
    enabled: !!orchardId, // Only fetch if orchardId is provided
    staleTime: 2 * 60 * 1000, // 2 minutes - trees and logs can change
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
  });
}

export function useOrchardTrees(
  orchardId: string,
  page: number = 1,
  limit: number = 20,
  filters?: {
    status?: string;
    zone?: string;
    searchTerm?: string;
  }
) {
  return useQuery({
    queryKey: queryKeys.orchardTrees(orchardId, { page, limit, filters }),
    queryFn: () => getOrchardTreesServer(orchardId, page, limit, filters),
    enabled: !!orchardId,
    staleTime: 1 * 60 * 1000, // 1 minute - tree status can change frequently
    gcTime: 2 * 60 * 1000, // 2 minutes cache time
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
  });
}

export function useOrchardActivityLogs(
  orchardId: string,
  page: number = 1,
  limit: number = 20,
  filters?: {
    logType?: string;
    zone?: string;
    dateFrom?: string;
    dateTo?: string;
  }
) {
  return useQuery({
    queryKey: queryKeys.orchardActivityLogs(orchardId, { page, limit, filters }),
    queryFn: () => getOrchardActivityLogsServer(orchardId, page, limit, filters),
    enabled: !!orchardId,
    staleTime: 30 * 1000, // 30 seconds - activity logs are very dynamic
    gcTime: 1 * 60 * 1000, // 1 minute cache time
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
  });
}

export function useDashboardData(orchardId: string, userId: string) {
  return useQuery({
    queryKey: queryKeys.dashboard(orchardId, userId),
    queryFn: () => getDashboardDataServer(orchardId, userId),
    enabled: !!orchardId && !!userId,
    staleTime: 30 * 1000, // 30 seconds - dashboard data is time-sensitive
    gcTime: 1 * 60 * 1000, // 1 minute cache time
    // Refetch dashboard data every 30 seconds when window is focused
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: false,
  });
}