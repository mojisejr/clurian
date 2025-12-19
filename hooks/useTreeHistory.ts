"use client";

import { useEffect, useMemo } from 'react';
import { useOrchardActivityLogs } from '@/lib/hooks/use-orchard-queries';
import type { Tree, Log } from '@/lib/types';

interface UseTreeHistoryOptions {
  tree: Tree;
  orchardId: string | null;
  enabled?: boolean;
}

interface UseTreeHistoryReturn {
  logs: Log[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook for handling tree history logic
 * Solves race conditions and duplicate query issues
 */
export function useTreeHistory({
  tree,
  orchardId,
  enabled = true,
}: UseTreeHistoryOptions): UseTreeHistoryReturn {
  // Fetch logs only when we have both orchardId and tree data
  const { data: logsData, isLoading, error, refetch } = useOrchardActivityLogs(orchardId || '', {
    enabled: !!orchardId && enabled,
    page: 1,
    limit: 1000,
  });

  // Force refetch when tree changes (for deep linking scenarios)
  useEffect(() => {
    if (orchardId && tree.id && enabled) {
      // Use setTimeout to avoid calling setState synchronously in effect
      const timeoutId = setTimeout(() => {
        refetch();
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [orchardId, tree.id, enabled, refetch]);

  // Filter logs for this specific tree
  const allLogs = logsData?.logs;
  const logs = useMemo(() => {
    if (!allLogs) return [];

    return allLogs.filter(log => {
      // Individual logs for this tree
      if (log.logType === 'INDIVIDUAL' && log.treeId === tree.id) {
        return true;
      }
      // Batch logs for this tree's zone
      if (log.logType === 'BATCH' && log.targetZone === tree.zone && log.orchardId === orchardId) {
        return true;
      }
      return false;
    });
  }, [allLogs, tree.id, tree.zone, orchardId]);

  return {
    logs,
    isLoading,
    error,
    refetch,
  };
}