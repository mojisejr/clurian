"use client";

import React, { memo, useCallback, useRef, useEffect } from 'react';
import { TreeCard } from '@/components/tree-card';
import { TreeCardSkeleton } from '@/components/ui/tree-card-skeleton';
import { cn } from '@/lib/utils';

interface Tree {
  id: string;
  orchardId: string;
  code: string;
  zone: string;
  type: string;
  variety: string;
  plantedDate?: string;
  status: 'healthy' | 'sick' | 'dead' | 'archived';
  replacedTreeId?: string;
  createdAt: string;
  updatedAt: string;
}

interface LazyTreeListProps {
  trees: Tree[];
  onTreeClick: (treeId: string) => void;
  loadingTreeId?: string | null;
  isLoading?: boolean;
  className?: string;
  itemHeight?: number;
  overscan?: number;
  estimatedItemHeight?: number;
  threshold?: number;
}

// Virtualized tree item component
const VirtualizedTreeItem = memo<{
  tree: Tree;
  onClick: (treeId: string) => void;
  loadingTreeId?: string | null;
  style: React.CSSProperties;
}>(({ tree, onClick, loadingTreeId, style }) => {
  return (
    <div style={style} className="border-b border-gray-100 last:border-b-0">
      <div onClick={() => onClick(tree.id)} className="cursor-pointer hover:bg-gray-50 transition-colors">
        <TreeCard
          tree={tree}
          isLoading={!!loadingTreeId && tree.id === loadingTreeId}
        />
      </div>
    </div>
  );
});

VirtualizedTreeItem.displayName = 'VirtualizedTreeItem';

// Skeleton item for virtual list
const VirtualizedSkeletonItem = memo<{ style: React.CSSProperties }>(({ style }) => (
  <div style={style} className="border-b border-gray-100">
    <TreeCardSkeleton />
  </div>
));

VirtualizedSkeletonItem.displayName = 'VirtualizedSkeletonItem';

export const LazyTreeList = memo<LazyTreeListProps>(({
  trees,
  onTreeClick,
  loadingTreeId,
  isLoading = false,
  className,
  itemHeight = 120, // Approximate height of TreeCard
  overscan = 5,
  estimatedItemHeight = 120,
  threshold = 100,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: 0 });
  const [containerHeight, setContainerHeight] = React.useState(0);
  const lastScrollTop = useRef(0);

  // Calculate visible range based on scroll position
  const calculateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;

    const scrollTop = containerRef.current.scrollTop;
    const containerHeight = containerRef.current.clientHeight;

    const start = Math.floor(scrollTop / estimatedItemHeight);
    const visibleCount = Math.ceil(containerHeight / estimatedItemHeight);
    const end = start + visibleCount;

    // Add overscan for smooth scrolling
    const overscanStart = Math.max(0, start - overscan);
    const overscanEnd = Math.min(trees.length, end + overscan);

    setVisibleRange({ start: overscanStart, end: overscanEnd });
    setContainerHeight(containerHeight);
    lastScrollTop.current = scrollTop;
  }, [trees.length, estimatedItemHeight, overscan]);

  // Handle scroll events with throttling
  const handleScroll = useCallback(() => {
    requestAnimationFrame(calculateVisibleRange);
  }, [calculateVisibleRange]);

  // Set up scroll listener and calculate initial range
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial calculation
    calculateVisibleRange();

    // Add scroll listener with passive option for better performance
    container.addEventListener('scroll', handleScroll, { passive: true });

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      calculateVisibleRange();
    });
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [handleScroll, calculateVisibleRange]);

  // For small lists, disable virtualization
  if (trees.length <= threshold) {
    return (
      <div className={cn("space-y-2", className)}>
        {isLoading && (
          <>
            <TreeCardSkeleton />
            <TreeCardSkeleton />
            <TreeCardSkeleton />
          </>
        )}
        {trees.map((tree) => (
          <div key={tree.id} onClick={() => onTreeClick(tree.id)} className="cursor-pointer hover:bg-gray-50 transition-colors rounded-lg">
            <TreeCard
              tree={tree}
              isLoading={loadingTreeId === tree.id}
            />
          </div>
        ))}
      </div>
    );
  }

  // Render virtualized list for large datasets
  const totalHeight = trees.length * estimatedItemHeight;
  const visibleTrees = trees.slice(visibleRange.start, visibleRange.end);

  return (
    <div
      ref={containerRef}
      className={cn("h-full overflow-auto", className)}
      style={{ height: containerHeight || '400px' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Top spacer */}
        <div
          style={{
            height: visibleRange.start * estimatedItemHeight,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        />

        {/* Visible items */}
        {visibleTrees.map((tree, index) => (
          <VirtualizedTreeItem
            key={tree.id}
            tree={tree}
            onClick={onTreeClick}
            loadingTreeId={loadingTreeId}
            style={{
              position: 'absolute',
              top: (visibleRange.start + index) * estimatedItemHeight,
              left: 0,
              right: 0,
              height: estimatedItemHeight,
            }}
          />
        ))}

        {/* Loading skeletons */}
        {isLoading && Array.from({ length: 3 }).map((_, index) => (
          <VirtualizedSkeletonItem
            key={`skeleton-${index}`}
            style={{
              position: 'absolute',
              top: (visibleRange.end + index) * estimatedItemHeight,
              left: 0,
              right: 0,
              height: estimatedItemHeight,
            }}
          />
        ))}

        {/* Bottom spacer */}
        <div
          style={{
            height: (trees.length - visibleRange.end) * estimatedItemHeight,
            position: 'absolute',
            top: visibleRange.end * estimatedItemHeight,
            left: 0,
            right: 0,
          }}
        />
      </div>
    </div>
  );
});

LazyTreeList.displayName = 'LazyTreeList';