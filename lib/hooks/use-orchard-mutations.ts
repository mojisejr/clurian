"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createOrchard,
  createTreeServer,
  createLogServer,
  updateTreeStatusServer,
  archiveTreeServer,
  updateLogServer
} from '@/app/actions/orchard';
import type { Tree, Log } from '@/lib/types';

export function useOrchardMutations() {
  const queryClient = useQueryClient();

  // Create orchard mutation
  const createOrchardMutation = useMutation({
    mutationFn: createOrchard,
    onSuccess: (newOrchard) => {
      // Invalidate and refetch orchards list
      queryClient.invalidateQueries({ queryKey: ['orchards'] });

      // Optionally, add the new orchard to the cache immediately
      if (newOrchard) {
        queryClient.setQueryData(['orchard', newOrchard.id], newOrchard);
      }
    },
    onError: (error) => {
      console.error('Failed to create orchard:', error);
    }
  });

  // Create tree mutation with optimistic update
  const createTreeMutation = useMutation({
    mutationFn: (treeData: Tree) => createTreeServer(treeData),
    onMutate: async (newTree) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['orchardData', newTree.orchardId] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['orchardData', newTree.orchardId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['orchardData', newTree.orchardId], (old: { trees: Tree[], logs: Log[] } | undefined) => {
        if (!old) return old;
        const optimisticTree = {
          ...newTree,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        return {
          ...old,
          trees: [optimisticTree, ...old.trees]
        };
      });

      // Return a context object with the snapshotted value
      return { previousData, orchardId: newTree.orchardId };
    },
    onError: (error, newTree, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(['orchardData', context.orchardId], context.previousData);
      }
      console.error('Failed to create tree:', error);
    },
    onSuccess: (savedTree, newTree, context) => {
      // Update the cache with the real data from server
      queryClient.setQueryData(['orchardData', context?.orchardId], (old: { trees: Tree[], logs: Log[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          trees: old.trees.map((tree: Tree) =>
            tree.id.startsWith('temp-') ? savedTree : tree
          )
        };
      });

      // Invalidate trees list to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ['orchardTrees', context?.orchardId]
      });

      // Invalidate orchards if zone was added
      queryClient.invalidateQueries({ queryKey: ['orchards'] });
    },
    onSettled: (_, __, context) => {
      // Always refetch after error or success
      if (context?.orchardId) {
        queryClient.invalidateQueries({ queryKey: ['orchardData', context.orchardId] });
      }
    }
  });

  // Update tree status mutation with optimistic update
  const updateTreeStatusMutation = useMutation({
    mutationFn: ({ treeId, status }: { treeId: string; status: string }) =>
      updateTreeStatusServer(treeId, status.toUpperCase() as 'HEALTHY' | 'SICK' | 'DEAD' | 'ARCHIVED'),
    onMutate: async ({ treeId, status }) => {
      // Find the orchard ID for this tree
      const allQueries = queryClient.getQueryCache().getAll();
      let orchardId: string | undefined;

      for (const query of allQueries) {
        const [queryKey] = query.queryKey;
        if (queryKey === 'orchardData' && Array.isArray(query.queryKey) && query.queryKey.length > 1) {
          const data = query.state.data as { trees: Tree[], logs: Log[] } | undefined;
          if (data?.trees?.some((tree: Tree) => tree.id === treeId)) {
            orchardId = query.queryKey[1] as string;
            break;
          }
        }
      }

      if (!orchardId) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['orchardData', orchardId] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['orchardData', orchardId]);

      // Optimistically update the tree status
      queryClient.setQueryData(['orchardData', orchardId], (old: { trees: Tree[], logs: Log[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          trees: old.trees.map((tree: Tree) =>
            tree.id === treeId ? { ...tree, status: status.toLowerCase() as Tree['status'] } : tree
          )
        };
      });

      return { previousData, orchardId };
    },
    onError: (error, __, context) => {
      // Roll back on error
      if (context?.previousData && context?.orchardId) {
        queryClient.setQueryData(['orchardData', context.orchardId], context.previousData);
      }
      console.error('Failed to update tree status:', error);
    },
    onSuccess: (_, __, context) => {
      // Invalidate related queries on success
      if (context?.orchardId) {
        queryClient.invalidateQueries({
          queryKey: ['orchardTrees', context.orchardId]
        });
        queryClient.invalidateQueries({
          queryKey: ['dashboard']
        });
      }
    }
  });

  // Archive tree mutation with optimistic update
  const archiveTreeMutation = useMutation({
    mutationFn: ({ treeId, newCode }: { treeId: string; newCode: string }) =>
      archiveTreeServer(treeId, newCode),
    onMutate: async ({ treeId, newCode }) => {
      // Find the orchard ID for this tree
      const allQueries = queryClient.getQueryCache().getAll();
      let orchardId: string | undefined;

      for (const query of allQueries) {
        const [queryKey] = query.queryKey;
        if (queryKey === 'orchardData' && Array.isArray(query.queryKey) && query.queryKey.length > 1) {
          const data = query.state.data as { trees: Tree[], logs: Log[] } | undefined;
          if (data?.trees?.some((tree: Tree) => tree.id === treeId)) {
            orchardId = query.queryKey[1] as string;
            break;
          }
        }
      }

      if (!orchardId) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['orchardData', orchardId] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['orchardData', orchardId]);

      // Optimistically update the tree
      queryClient.setQueryData(['orchardData', orchardId], (old: { trees: Tree[], logs: Log[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          trees: old.trees.map((tree: Tree) =>
            tree.id === treeId
              ? { ...tree, status: 'archived' as Tree['status'], code: newCode }
              : tree
          )
        };
      });

      return { previousData, orchardId };
    },
    onError: (error, __, context) => {
      // Roll back on error
      if (context?.previousData && context?.orchardId) {
        queryClient.setQueryData(['orchardData', context.orchardId], context.previousData);
      }
      console.error('Failed to archive tree:', error);
    },
    onSuccess: (_, __, context) => {
      // Invalidate related queries on success
      if (context?.orchardId) {
        queryClient.invalidateQueries({
          queryKey: ['orchardTrees', context.orchardId]
        });
        queryClient.invalidateQueries({
          queryKey: ['dashboard']
        });
      }
    }
  });

  // Create log mutation with optimistic update
  const createLogMutation = useMutation({
    mutationFn: (logData: Log) => createLogServer(logData),
    onMutate: async (newLog) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['orchardData', newLog.orchardId] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['orchardData', newLog.orchardId]);

      // Optimistically add the new log
      queryClient.setQueryData(['orchardData', newLog.orchardId], (old: { trees: Tree[], logs: Log[] } | undefined) => {
        if (!old) return old;
        const optimisticLog = {
          ...newLog,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        return {
          ...old,
          logs: [optimisticLog, ...old.logs]
        };
      });

      return { previousData, orchardId: newLog.orchardId };
    },
    onError: (error, newLog, context) => {
      // Roll back on error
      if (context?.previousData) {
        queryClient.setQueryData(['orchardData', context.orchardId], context.previousData);
      }
      console.error('Failed to create log:', error);
    },
    onSuccess: (savedLog, newLog, context) => {
      // Update the cache with real data
      queryClient.setQueryData(['orchardData', context?.orchardId], (old: { trees: Tree[], logs: Log[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          logs: old.logs.map((log: Log) =>
            log.id.startsWith('temp-') ? savedLog : log
          )
        };
      });

      // Invalidate activity logs queries
      queryClient.invalidateQueries({
        queryKey: ['orchardActivityLogs', context?.orchardId]
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard']
      });
    }
  });

  // Update log mutation
  const updateLogMutation = useMutation({
    mutationFn: updateLogServer,
    onSuccess: (_, log) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({
        queryKey: ['orchardData', log.orchardId]
      });
      queryClient.invalidateQueries({
        queryKey: ['orchardActivityLogs', log.orchardId]
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard']
      });
    },
    onError: (error) => {
      console.error('Failed to update log:', error);
    }
  });

  return {
    createOrchard: createOrchardMutation,
    createTree: createTreeMutation,
    updateTreeStatus: updateTreeStatusMutation,
    archiveTree: archiveTreeMutation,
    createLog: createLogMutation,
    updateLog: updateLogMutation,
  };
}