"use client";

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ITEMS_PER_PAGE, ZONE_FILTER_ALL } from "@/lib/constants";
import { useOrchard } from "@/components/providers/orchard-provider";
import { TreeCard } from "@/components/tree-card";
import { Pagination } from "@/components/pagination";
import { ZoneFilter } from "@/components/zone-filter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Printer, Sprout, PlusCircle, ClipboardList, Loader2 } from "lucide-react";
import QRCode from 'qrcode';

// Dynamically import PDF Download Link to avoid SSR issues
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => <Button variant="ghost" size="sm" disabled><Loader2 className="animate-spin mr-1" size={14} /> Loading PDF...</Button>,
  }
);

import { OrchardQRDocument } from "@/components/pdf/orchard-qr-document";

interface DashboardViewProps {
  onViewChange: (view: 'add_tree' | 'add_batch_log' | 'tree_detail') => void;
  onIdentifyTree: (treeId: string) => void;
}

interface QRItem {
  code: string;
  zone: string;
  url: string;
  type: string;
  variety: string;
  plantedDate?: string;
  qrDataUrl?: string;
}

export function DashboardView({ onViewChange, onIdentifyTree }: DashboardViewProps) {
  const { trees, currentOrchardId, currentOrchard } = useOrchard();
  
  const [filterZone, setFilterZone] = useState(ZONE_FILTER_ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [qrData, setQrData] = useState<QRItem[]>([]);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string>('');

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

  // --- QR Generation ---
  useEffect(() => {
    const generateQRs = async () => {
      if (processedTrees.length === 0) return;
      
      setIsGeneratingQR(true);
      const data = await Promise.all(processedTrees.map(async (tree) => {
        // Current host logic placeholder - ideally use ENV or window.location
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://clurian.com';
        const url = `${baseUrl}/dashboard?treeId=${tree.id}`;
        
        try {
          const qrDataUrl = await QRCode.toDataURL(url);
          return {
            ...tree,
            plantedDate: tree.plantedDate, // Ensure this field exists
            url,
            qrDataUrl
          };
        } catch (e) {
          console.error('QR Gen Error', e);
          return { ...tree, url };
        }
      }));
      setQrData(data);
      setIsGeneratingQR(false);
    };

    const timer = setTimeout(() => {
        generateQRs();
    }, 1000); // Debounce slightly

    return () => clearTimeout(timer);
  }, [processedTrees]);

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
          {processedTrees.length > 0 && !isGeneratingQR ? (
             <PDFDownloadLink
                document={
                    <OrchardQRDocument 
                        trees={qrData} 
                        orchardName={currentOrchard.name} 
                        logoUrl={logoBase64} // Pass Logo
                    />
                }
                fileName={`QR_Codes_${currentOrchard.name}_${new Date().toISOString().split('T')[0]}.pdf`}
             >
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                    <Printer size={14} className="mr-1" /> พิมพ์ QR ({qrData.length})
                </Button>
             </PDFDownloadLink>
          ) : (
            <Button variant="ghost" size="sm" disabled className="text-xs text-muted-foreground">
                 <Loader2 className="animate-spin mr-1" size={14} /> เตรียม QR...
            </Button>
          )}

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
    </div>
  );
}
