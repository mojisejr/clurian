"use client";

import React, { useState, useEffect } from 'react';
import { useOrchard } from "@/components/providers/orchard-provider";
import { useOrchardTrees } from '@/lib/hooks/use-orchard-queries';
import { useSpecificCacheInvalidation } from '@/lib/hooks/use-orchard-queries';
import { RefreshButton } from '@/components/ui/refresh-button';
import { TreeCard } from "@/components/tree-card";
import { TreeCardSkeleton } from "@/components/ui/tree-card-skeleton";
import { Pagination } from "@/components/pagination";
import { PDFGeneratorModal } from "@/components/modals/pdf-generator-modal";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { Button } from "@/components/ui/button";
import { Sprout, PlusCircle } from "lucide-react";

interface DashboardViewProps {
  onViewChange: (view: 'add_tree' | 'add_batch_log' | 'tree_detail') => void;
  onIdentifyTree: (treeId: string) => void;
  loadingTreeId?: string | null;
  isAddingNewTree?: boolean;
}

export function DashboardView({ onViewChange, onIdentifyTree, loadingTreeId, isAddingNewTree = false }: DashboardViewProps) {
  // React Query for trees data
  const [currentPage, setCurrentPage] = useState(1);
  const [filterZone, setFilterZone] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    currentOrchard,
    currentOrchardId
  } = useOrchard();

  const { data: treesData, isLoading, error, refetch } = useOrchardTrees(currentOrchardId, {
    page: currentPage,
    filters: {
      zone: filterZone !== 'ALL' ? filterZone : undefined,
      status: filterStatus !== 'ALL' ? filterStatus : undefined,
      searchTerm: searchTerm || undefined,
    }
  });

  // Fetch ALL trees for PDF export (ignoring pagination)
  const { data: allTreesData } = useOrchardTrees(currentOrchardId, {
    page: 1,
    limit: 10000, // Get all trees for export
    filters: {
      // Apply same filters for export consistency
      zone: filterZone !== 'ALL' ? filterZone : undefined,
      status: filterStatus !== 'ALL' ? filterStatus : undefined,
      searchTerm: searchTerm || undefined,
    }
  });

  const { invalidateSpecificTrees } = useSpecificCacheInvalidation();

  const trees = treesData?.trees || [];
  const allTrees = allTreesData?.trees || []; // All trees for PDF export
  const pagination = treesData?.pagination;
  const totalTrees = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 0;

  const handleRefresh = async () => {
    await invalidateSpecificTrees(currentOrchardId);
  };

  const clearFilters = () => {
    setFilterZone('ALL');
    setFilterStatus('ALL');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const [logoBase64, setLogoBase64] = useState<string>('');
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);

  const orchardZones = ['ALL', ...(currentOrchard?.zones || [])];
  const itemsPerPage = pagination?.limit || 100;

  // Calculate stats from the paginated trees
  const sickTreesCount = trees.filter(t => t.status === 'sick').length;
  const healthyTreesCount = trees.filter(t => t.status === 'healthy').length;
  const deadTreesCount = trees.filter(t => t.status === 'dead').length;
  const archivedTreesCount = trees.filter(t => t.status === 'archived').length;

  // --- Load Logo (Once) ---
  useEffect(() => {
      const loadLogo = async () => {
          try {
              const res = await fetch('/logo-1.png');
              const blob = await res.blob();
              const reader = new FileReader();
              reader.onloadend = () => {
                  setLogoBase64(reader.result as string);
              };
              reader.readAsDataURL(blob);
          } catch (e) {
              console.error("Failed to load logo for PDF", e);
          }
      };
      loadLogo();
  }, []);

  return (
    <div className="space-y-4">
      {/* Header Stats with Refresh */}
      <div className="flex gap-4">
        <StatsCards
          stats={{
            totalTrees,
            healthyTrees: healthyTreesCount,
            sickTrees: sickTreesCount,
            deadTrees: deadTreesCount,
            archivedTrees: archivedTreesCount
          }}
        />

        {/* Refresh Button */}
        <RefreshButton
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          label="รีเฟรช"
          tooltip="ดึงข้อมูลล่าสุดจากเซิร์ฟเวอร์"
          className="self-start"
        />
      </div>

      {/* Action Button */}
      <Button
          className="w-full gap-2"
          onClick={() => onViewChange('add_tree')}
      >
        <PlusCircle size={18} /> ลงทะเบียนต้นใหม่
      </Button>

      {/* Filter & Search */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterZone={filterZone}
        onZoneChange={setFilterZone}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        onClearFilters={clearFilters}
        onExportPDF={() => setIsPDFModalOpen(true)}
        orchardZones={orchardZones}
        totalTrees={totalTrees}
        isLoading={isLoading}
      />

      {/* Tree List */}
      <div className="space-y-2">
        {/* Error State */}
        {error && (
          <div className="bg-destructive/15 border border-destructive/20 text-destructive p-4 rounded-lg">
            <p className="text-sm">เกิดข้อผิดพลาดในการโหลดข้อมูล: {error.message}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-2"
            >
              ลองใหม่
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !isAddingNewTree && (
          <div className="space-y-2">
            <TreeCardSkeleton />
            <TreeCardSkeleton />
            <TreeCardSkeleton />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && trees.length === 0 && !isAddingNewTree && (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
                <Sprout className="mx-auto mb-2 opacity-50" size={48} />
                <p>ไม่พบข้อมูลต้นไม้</p>
            </div>
        )}

        {/* Tree List Content */}
        {!isLoading && !error && (trees.length > 0 || isAddingNewTree) && (
            <>
              {/* Show skeleton when adding new tree */}
              {isAddingNewTree && (
                <>
                  <TreeCardSkeleton />
                  <TreeCardSkeleton />
                  <TreeCardSkeleton />
                </>
              )}

              {/* Render actual trees */}
              {trees.map(tree => (
                  <div key={tree.id} onClick={() => onIdentifyTree(tree.id)}>
                      <TreeCard
                          tree={tree}
                          isLoading={loadingTreeId === tree.id}
                      />
                  </div>
              ))}

              {/* Show empty state if no trees but loading */}
              {trees.length === 0 && isAddingNewTree && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  กำลังเพิ่มต้นไม้ใหม่...
                </div>
              )}
            </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalTrees}
            itemsPerPage={itemsPerPage}
          />
      )}
      
      <div className="pt-4 border-t text-center text-xs text-muted-foreground">
          CLURIAN: Orchard Manager v1.1
      </div>

      {/* PDF Generator Modal */}
      <PDFGeneratorModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        // Use ALL trees for PDF export (not just current page)
        trees={allTrees}
        orchardName={currentOrchard?.name || ''}
        logoBase64={logoBase64}
      />
    </div>
  );
}
