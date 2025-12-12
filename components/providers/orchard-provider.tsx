"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import type { Orchard, Tree, Log, PaginationMetadata } from "@/lib/types";
import {
    useOrchards,
    useOrchardData
} from "@/lib/hooks/use-orchard-queries";
import {
    useOrchardMutations
} from "@/lib/hooks/use-orchard-mutations";

interface OrchardContextType {
  orchards: Orchard[];
  isLoadingOrchards: boolean;
  currentOrchardId: string;
  currentOrchard: Orchard | undefined;
  setCurrentOrchardId: (id: string) => void;
  addOrchard: (name: string) => Promise<void>;

  trees: Tree[];
  isLoadingOrchardData: boolean;
  addTree: (tree: Tree) => Promise<Tree | null>;
  updateTree: (treeId: string, updates: Partial<Tree>) => Promise<void>;

  logs: Log[];
  addLog: (log: Log) => Promise<void>;
  updateLogs: (logs: Log[]) => Promise<void>;

  // Pagination state
  currentPage: number;
  totalPages: number;
  totalTrees: number;
  pagination: PaginationMetadata | undefined;
  setCurrentPage: (page: number) => void;

  // Computed values for activity counts
  batchActivityCount: number;
  scheduledActivityCount: number;
  inProgressLogsCount: number;
  completedLogsCount: number;
}

const OrchardContext = createContext<OrchardContextType | undefined>(undefined);

export function OrchardProvider({ children }: { children: React.ReactNode }) {
  // React Query hooks
  const { data: orchards = [], isLoading: isLoadingOrchards, error: orchardsError } = useOrchards();
  const [currentOrchardId, setCurrentOrchardId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { data: orchardData, isLoading: isLoadingOrchardData, error: orchardDataError } = useOrchardData(currentOrchardId, currentPage, 100);
  const mutations = useOrchardMutations();

  // Extract trees, logs, and pagination from orchardData
  const trees = orchardData?.trees || [];
  const logs = orchardData?.logs || [];
  const pagination = orchardData?.pagination;
  const totalPages = pagination?.totalPages || 0;
  const totalTrees = pagination?.total || 0;

  // Find current orchard
  const currentOrchard = orchards.find((o) => o.id === currentOrchardId);

  // Computed values for activity counts
  const batchActivityCount = logs.filter(log =>
    log.orchardId === currentOrchardId &&
    log.logType === 'BATCH'
  ).length;

  const scheduledActivityCount = logs.filter(log =>
    log.orchardId === currentOrchardId &&
    log.followUpDate &&
    log.status === 'IN_PROGRESS'
  ).length;

  const inProgressLogsCount = logs.filter(log =>
    log.orchardId === currentOrchardId &&
    log.status === 'IN_PROGRESS'
  ).length;

  const completedLogsCount = logs.filter(log =>
    log.orchardId === currentOrchardId &&
    log.status === 'COMPLETED'
  ).length;

  // Reset pagination when changing orchards
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentOrchardId, currentPage]);

  // Initialize with first orchard using a ref and setTimeout to avoid cascade
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current && orchards.length > 0 && !currentOrchardId) {
      hasInitialized.current = true;
      // Use setTimeout to avoid synchronous state update in effect
      setTimeout(() => setCurrentOrchardId(orchards[0].id), 0);
    }
  }, [orchards, currentOrchardId]);

  // Error handling
  useEffect(() => {
    if (orchardsError || orchardDataError) {
      console.error("Data fetching error:", orchardsError || orchardDataError);
      if ((orchardsError || orchardDataError)?.message?.includes("Unauthorized")) {
        window.location.href = '/login';
      }
    }
  }, [orchardsError, orchardDataError]);

  // --- Actions ---

  const handleAddOrchard = async (name: string) => {
    await mutations.createOrchard.mutateAsync(name);
    // The mutation will update the cache, and React Query will automatically refetch
  };

  const handleAddTree = async (tree: Tree) => {
    const result = await mutations.createTree.mutateAsync(tree);
    return result;
  };

  const handleUpdateTree = async (treeId: string, updates: Partial<Tree>) => {
    if (updates.status) {
      if (updates.status === 'archived' && updates.code) {
        await mutations.archiveTree.mutateAsync({ treeId, newCode: updates.code });
      } else {
        await mutations.updateTreeStatus.mutateAsync({ treeId, status: updates.status });
      }
    }
  };

  const handleAddLog = async (log: Log) => {
    await mutations.createLog.mutateAsync(log);
  };

  const handleUpdateLogs = async (updatedLogs: Log[]) => {
    // For each log, determine if it's new or existing
    for (const log of updatedLogs) {
      if (typeof log.id === 'string' && log.id.startsWith('temp-')) {
        // New log - use create mutation
        await mutations.createLog.mutateAsync(log);
      } else {
        // Existing log - use update mutation
        await mutations.updateLog.mutateAsync(log);
      }
    }
  };

  return (
    <OrchardContext.Provider
      value={{
        orchards,
        isLoadingOrchards,
        currentOrchardId,
        currentOrchard,
        setCurrentOrchardId,
        addOrchard: handleAddOrchard,
        trees,
        isLoadingOrchardData,
        addTree: handleAddTree,
        updateTree: handleUpdateTree,
        logs,
        addLog: handleAddLog,
        updateLogs: handleUpdateLogs,
        currentPage,
        totalPages,
        totalTrees,
        pagination,
        setCurrentPage,
        batchActivityCount,
        scheduledActivityCount,
        inProgressLogsCount,
        completedLogsCount
      }}
    >
      {children}
    </OrchardContext.Provider>
  );
}

export function useOrchard() {
  const context = useContext(OrchardContext);
  if (context === undefined) {
    throw new Error("useOrchard must be used within an OrchardProvider");
  }
  return context;
}
