/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { OrchardContext } from '@/components/providers/orchard-provider';

interface MockOrchardProviderProps {
  children: ReactNode;
  trees?: any[];
  currentOrchard?: any;
  isLoadingTrees?: boolean;
  isLoadingOrchards?: boolean;
  batchActivityCount?: number;
  scheduledActivityCount?: number;
  filterZone?: string;
  filterStatus?: string;
  searchTerm?: string;
  currentPage?: number;
}

const createMockOrchardProvider = (overrides: Partial<MockOrchardProviderProps> = {}) => {
  const {
    trees = [],
    currentOrchard = null,
    isLoadingTrees = false,
    isLoadingOrchards = false,
    batchActivityCount = 0,
    scheduledActivityCount = 0,
    filterZone = 'ALL',
    filterStatus = 'ALL',
    searchTerm = '',
    currentPage = 1,
  } = overrides;

  const MockOrchardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const mockValue = {
      currentOrchardId: currentOrchard?.id || null,
      currentOrchard,
      trees,
      addTree: vi.fn(),
      updateTree: vi.fn(),
      addLog: vi.fn(),
      updateLogs: vi.fn(),
      addOrchard: vi.fn(),
      updateOrchard: vi.fn(),
      setCurrentOrchardId: vi.fn(),
      filterZone,
      setFilterZone: vi.fn(),
      filterStatus,
      setFilterStatus: vi.fn(),
      searchTerm,
      setSearchTerm: vi.fn(),
      currentPage,
      setCurrentPage: vi.fn(),
      batchActivityCount,
      scheduledActivityCount,
      isLoadingTrees,
      isLoadingOrchards,
      isFetchingOrchardData: false,
      orchards: [],
      totalPages: 1,
      totalTrees: trees.length,
      pagination: {
        page: currentPage,
        limit: 10,
        total: trees.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
      clearFilters: vi.fn(),
      inProgressLogsCount: 0,
      completedLogsCount: 0,
    };

    return (
      <OrchardContext.Provider value={mockValue}>
        {children}
      </OrchardContext.Provider>
    );
  };

  return MockOrchardProvider;
};

export { createMockOrchardProvider, OrchardContext };

// Mock hook for useOrchard
export const useOrchard = () => {
  const context = React.useContext(OrchardContext);
  if (!context) {
    throw new Error('useOrchard must be used within OrchardProvider');
  }
  return context;
};