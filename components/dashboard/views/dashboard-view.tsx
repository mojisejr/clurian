"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { ZONE_FILTER_ALL } from "@/lib/constants";
import { useOrchard } from "@/components/providers/orchard-provider";
import { TreeCard } from "@/components/tree-card";
import { TreeCardSkeleton } from "@/components/ui/tree-card-skeleton";
import { Pagination } from "@/components/pagination";
import { ZoneFilter } from "@/components/zone-filter";
import { PDFGeneratorModal } from "@/components/modals/pdf-generator-modal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sprout, PlusCircle, Printer } from "lucide-react";

interface DashboardViewProps {
  onViewChange: (view: 'add_tree' | 'add_batch_log' | 'tree_detail') => void;
  onIdentifyTree: (treeId: string) => void;
  loadingTreeId?: string | null;
  isAddingNewTree?: boolean;
}

export function DashboardView({ onViewChange, onIdentifyTree, loadingTreeId, isAddingNewTree = false }: DashboardViewProps) {
  const {
    trees,
    totalTrees,
    currentPage,
    totalPages,
    pagination,
    setCurrentPage,
    currentOrchardId,
    currentOrchard
  } = useOrchard();

  const [filterZone, setFilterZone] = useState(ZONE_FILTER_ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [logoBase64, setLogoBase64] = useState<string>('');
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);

  const orchardZones = currentOrchard?.zones || [];
  const itemsPerPage = pagination?.limit || 100;

  // For now, search/filter works on current page data
  // In Phase 2, we'll move this to server-side
  const processedTrees = useMemo(() => {
    let result = trees.filter(t => t.status !== 'archived');

    if (filterZone !== ZONE_FILTER_ALL) {
      result = result.filter(t => t.zone === filterZone);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.code.toLowerCase().includes(query) ||
        t.variety.includes(query)
      );
    }

    return result;
  }, [trees, filterZone, searchQuery]);

  // Use totalTrees from server pagination instead
  const sickTreesCount = trees.filter(t => t.status === 'sick').length;
  const activeTreesCount = totalTrees;

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
      {/* Header Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 border shadow-sm">
          <div className="text-muted-foreground text-xs">ทั้งหมดในสวนนี้</div>
          <div className="text-2xl font-bold text-primary">{activeTreesCount} ต้น</div>
        </Card>
        <Card className="p-4 border shadow-sm">
          <div className="text-muted-foreground text-xs">ต้องดูแลพิเศษ</div>
          <div className="text-2xl font-bold text-destructive">{sickTreesCount} ต้น</div>
        </Card>
      </div>

      {/* Action Button */}
      <Button
          className="w-full gap-2"
          onClick={() => onViewChange('add_tree')}
      >
        <PlusCircle size={18} /> ลงทะเบียนต้นใหม่
      </Button>

      {/* Filter & Search */}
      <Card className="p-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            className="pl-10" 
            placeholder="ค้นหาเลขต้น..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <ZoneFilter 
            zones={orchardZones} 
            activeZone={filterZone} 
            onZoneChange={setFilterZone} 
          />
          
          {/* Export PDF Button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => setIsPDFModalOpen(true)}
            disabled={totalTrees === 0}
          >
            <Printer size={14} className="mr-1" />
            พิมพ์ QR ({totalTrees})
          </Button>
        </div>
      </Card>

      {/* Tree List */}
      <div className="space-y-2">
        {processedTrees.length === 0 && !isAddingNewTree ? (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
                <Sprout className="mx-auto mb-2 opacity-50" size={48} />
                <p>ไม่พบข้อมูลต้นไม้</p>
            </div>
        ) : (
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
              {processedTrees.map(tree => (
                  <div key={tree.id} onClick={() => onIdentifyTree(tree.id)}>
                      <TreeCard
                          tree={tree}
                          isLoading={loadingTreeId === tree.id}
                      />
                  </div>
              ))}

              {/* Show empty state if no trees but loading */}
              {processedTrees.length === 0 && isAddingNewTree && (
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
        // For PDF export, we'll need all trees, not just current page
        // This is a limitation for now - in Phase 2 we'll implement proper export
        trees={trees}
        orchardName={currentOrchard?.name || ''}
        logoBase64={logoBase64}
      />
    </div>
  );
}
