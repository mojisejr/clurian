import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Tree } from '@/lib/types';

interface UseDashboardDeepLinkingProps {
  trees: Tree[];
  isLoadingTrees: boolean;
}

interface UseDashboardDeepLinkingReturn {
  selectedTreeId: string | null;
  isLoadingTreeDetail: boolean;
  treeNotFound: boolean;
  setSelectedTreeId: (id: string | null) => void;
}

/**
 * Status of deep linking operation
 */
export type DeepLinkStatus = 'idle' | 'loading' | 'success' | 'not_found';

/**
 * Custom hook for handling dashboard deep linking with treeId parameter
 * Manages state and logic for direct navigation to tree details
 */
export function useDashboardDeepLinking({
  trees,
  isLoadingTrees,
}: UseDashboardDeepLinkingProps): UseDashboardDeepLinkingReturn {
  const searchParams = useSearchParams();
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);

  const treeId = searchParams.get('treeId');
  const hasTreeId = !!treeId;
  const treeFound = hasTreeId && trees.some(t => t.id === treeId);
  const treeNotFound = hasTreeId && trees.length > 0 && !treeFound;
  const isLoadingTreeDetail = hasTreeId && trees.length === 0 && !isLoadingTrees;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (treeId && trees.length > 0) {
        if (trees.some(t => t.id === treeId) && selectedTreeId !== treeId) {
          setSelectedTreeId(treeId);
        }
      } else if (!treeId && selectedTreeId) {
        // If no treeId in URL but we have selectedTreeId, clear it
        setSelectedTreeId(null);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [treeId, trees, selectedTreeId]);

  return {
    selectedTreeId,
    isLoadingTreeDetail,
    treeNotFound,
    setSelectedTreeId,
  };
}