"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { ITEMS_PER_PAGE, ZONE_FILTER_ALL } from "@/lib/constants";
import { useOrchard } from "@/components/providers/orchard-provider";
import { TreeCard } from "@/components/tree-card";
import { Pagination } from "@/components/pagination";
import { ZoneFilter } from "@/components/zone-filter";
import { PDFGeneratorModal } from "@/components/modals/pdf-generator-modal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sprout, PlusCircle, ClipboardList, Printer } from "lucide-react";

interface DashboardViewProps {
  onViewChange: (view: 'add_tree' | 'add_batch_log' | 'tree_detail') => void;
  onIdentifyTree: (treeId: string) => void;
}

export function DashboardView({ onViewChange, onIdentifyTree }: DashboardViewProps) {
  const { trees, currentOrchardId, currentOrchard } = useOrchard();
  
  const [filterZone, setFilterZone] = useState(ZONE_FILTER_ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [logoBase64, setLogoBase64] = useState<string>('');
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);

  const orchardZones = currentOrchard.zones;

  const processedTrees = useMemo(() => {
    let result = trees.filter(t => t.orchardId === currentOrchardId && t.status !== 'archived');
    
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
    
    result.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' }));
    
    return result;
  }, [trees, currentOrchardId, filterZone, searchQuery]);

  const paginatedTrees = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return {
      data: processedTrees.slice(start, end),
      totalPages: Math.ceil(processedTrees.length / ITEMS_PER_PAGE),
      totalItems: processedTrees.length
    };
  }, [processedTrees, currentPage]);

  const currentOrchardTrees = trees.filter(t => t.orchardId === currentOrchardId);
  const sickTreesCount = currentOrchardTrees.filter(t => t.status === 'sick').length;
  const activeTreesCount = currentOrchardTrees.filter(t => t.status !== 'archived').length;

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

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        <Button 
            className="w-full gap-2" 
            onClick={() => onViewChange('add_tree')}
        >
          <PlusCircle size={18} /> ลงทะเบียนต้นใหม่
        </Button>
        <Button 
            variant="secondary" 
            className="w-full gap-2"
            onClick={() => onViewChange('add_batch_log')}
        >
          <ClipboardList size={18} /> บันทึกงานทั้งแปลง
        </Button>
      </div>

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
            disabled={processedTrees.length === 0}
          >
            <Printer size={14} className="mr-1" /> 
            พิมพ์ QR ({processedTrees.length})
          </Button>
        </div>
      </Card>

      {/* Tree List */}
      <div className="space-y-2">
        {paginatedTrees.data.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
                <Sprout className="mx-auto mb-2 opacity-50" size={48} />
                <p>ไม่พบข้อมูลต้นไม้</p>
            </div>
        ) : (
            paginatedTrees.data.map(tree => (
                <div key={tree.id} onClick={() => onIdentifyTree(tree.id)}>
                    <TreeCard tree={tree} />
                </div>
            ))
        )}
      </div>

      {/* Pagination */}
      {paginatedTrees.totalPages > 1 && (
          <Pagination 
            currentPage={currentPage}
            totalPages={paginatedTrees.totalPages}
            onPageChange={setCurrentPage}
            totalItems={paginatedTrees.totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
          />
      )}
      
      <div className="pt-4 border-t text-center text-xs text-muted-foreground">
          CLURIAN: Orchard Manager v1.1
      </div>

      {/* PDF Generator Modal */}
      <PDFGeneratorModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        trees={processedTrees}
        orchardName={currentOrchard?.name || ''}
        logoBase64={logoBase64}
      />
    </div>
  );
}
