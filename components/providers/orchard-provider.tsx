"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  isFetchingOrchardData: boolean;

  // Filter state
  currentPage: number;
  totalPages: number;
  totalTrees: number;
  pagination: PaginationMetadata | undefined;
  setCurrentPage: (page: number) => void;
  filterZone: string;
  filterStatus: string;
  searchTerm: string;
  setFilterZone: (zone: string) => void;
  setFilterStatus: (status: string) => void;
  setSearchTerm: (term: string) => void;
  clearFilters: () => void;

  // Tree management functions (still needed for mutations)
  addTree: (tree: Tree) => Promise<Tree | null>;
  updateTree: (treeId: string, updates: Partial<Tree>) => Promise<void>;

  // Log management functions (still needed for mutations)
  addLog: (log: Log) => Promise<void>;
  updateLogs: (logs: Log[]) => Promise<void>;

  // Computed values - these will be calculated from orchardData
  batchActivityCount: number;
  scheduledActivityCount: number;
  inProgressLogsCount: number;
  completedLogsCount: number;
}

const OrchardContext = createContext<OrchardContextType | undefined>(undefined);

export function OrchardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // React Query hooks
  const { data: orchards = [], isLoading: isLoadingOrchards, error: orchardsError } = useOrchards();
  const [currentOrchardId, setCurrentOrchardId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter state
  const [filterZone, setFilterZone] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Build query options
  const queryOptions = useMemo(() => ({
    page: currentPage,
    filters: {
      zone: filterZone !== "ALL" ? filterZone : undefined,
      status: filterStatus !== "ALL" ? filterStatus : undefined,
      searchTerm: searchTerm || undefined,
    }
  }), [currentPage, filterZone, filterStatus, searchTerm]);

  const { data: orchardData, isFetching: isFetchingOrchardData, error: orchardDataError } = useOrchardData(currentOrchardId, queryOptions);
  const mutations = useOrchardMutations();

  // Extract pagination from orchardData
  const pagination = orchardData?.pagination;
  const totalPages = pagination?.totalPages || 0;
  const totalTrees = pagination?.total || 0;

  // Extract logs for computed values (not exposing directly)
  const logs = orchardData?.logs || [];

  // Clear filters helper
  const clearFilters = useCallback(() => {
    setFilterZone("ALL");
    setFilterStatus("ALL");
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

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

  // Reset to page 1 when filters change (use ref to avoid stale closure)
  const prevFiltersRef = useRef({ filterZone, filterStatus, searchTerm });

  useEffect(() => {
    const hasFilterChanged =
      prevFiltersRef.current.filterZone !== filterZone ||
      prevFiltersRef.current.filterStatus !== filterStatus ||
      prevFiltersRef.current.searchTerm !== searchTerm;

    if (hasFilterChanged) {
      // Update ref after check
      prevFiltersRef.current = { filterZone, filterStatus, searchTerm };
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentPage(1);
    }
  }, [filterZone, filterStatus, searchTerm, setCurrentPage]);

  // Reset pagination and filters when changing orchards
  useEffect(() => {
    // Schedule state updates for next tick to avoid cascade
    setTimeout(() => {
      clearFilters();
      prevFiltersRef.current = { filterZone: 'ALL', filterStatus: 'ALL', searchTerm: '' };
      setCurrentPage(1);
    }, 0);
  }, [currentOrchardId, clearFilters, setCurrentPage]);

  // Clear treeId from URL when orchard changes to prevent cross-orchard contamination
  const previousOrchardIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Only run on client side and when we have a current orchard
    if (typeof window === 'undefined' || !currentOrchardId) return;

    // Only clear treeId if we're switching to a different orchard (not initial load)
    if (previousOrchardIdRef.current && previousOrchardIdRef.current !== currentOrchardId) {
      // Check if URL has treeId parameter
      const currentUrl = new URL(window.location.href);
      const treeId = currentUrl.searchParams.get('treeId');

      if (treeId) {
        // Remove treeId parameter while preserving other params
        currentUrl.searchParams.delete('treeId');

        // Create clean URL without treeId
        const newPathname = currentUrl.pathname;
        const newSearch = currentUrl.searchParams.toString();
        const newUrl = `${newPathname}${newSearch ? `?${newSearch}` : ''}`;

        // Use replace to avoid adding to history
        router.replace(newUrl);
      }
    }

    // Update ref for next comparison
    previousOrchardIdRef.current = currentOrchardId;
  }, [currentOrchardId, router]);

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
        isFetchingOrchardData,
        currentPage,
        totalPages,
        totalTrees,
        pagination,
        setCurrentPage,
        filterZone,
        filterStatus,
        searchTerm,
        setFilterZone,
        setFilterStatus,
        setSearchTerm,
        clearFilters,
        addTree: handleAddTree,
        updateTree: handleUpdateTree,
        addLog: handleAddLog,
        updateLogs: handleUpdateLogs,
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
