"use client";

import React, { useState, useMemo } from 'react';
import type { Tree, Log } from "@/lib/types";
import { useOrchard } from "@/components/providers/orchard-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    ClipboardList, 
    Search,
    ArrowUpDown,
    Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TreeHistorySectionProps {
  tree: Tree;
  onLogClick: (log: Log) => void;
}

export function TreeHistorySection({ tree, onLogClick }: TreeHistorySectionProps) {
  const { logs, currentOrchardId } = useOrchard();
  
  // History Filter State
  const [historyTab, setHistoryTab] = useState<'all' | 'batch' | 'followup'>('all');
  const [historySearch, setHistorySearch] = useState('');
  const [historySort, setHistorySort] = useState<'desc' | 'asc'>('desc');

  // --- Derived Data ---
  const filteredHistory = useMemo(() => {
    let result = logs.filter(l =>
        (l.logType === 'INDIVIDUAL' && l.treeId === tree.id) ||
        (l.logType === 'BATCH' && l.targetZone === tree.zone && l.orchardId === currentOrchardId)
    );

    if (historyTab === 'followup') {
        result = result.filter(l => l.status === 'IN_PROGRESS');
    } else if (historyTab === 'batch') {
        result = result.filter(l => l.logType === 'BATCH');
    }

    if (historySearch) {
        const q = historySearch.toLowerCase();
        result = result.filter(l =>
            l.action.toLowerCase().includes(q) ||
            (l.note && l.note.toLowerCase().includes(q))
        );
    }

    result.sort((a,b) => {
        const timeA = new Date(a.performDate).getTime();
        const timeB = new Date(b.performDate).getTime();
        return historySort === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [logs, tree.id, tree.zone, currentOrchardId, historyTab, historySearch, historySort]);

  return (
      <div className="space-y-4">
           <div className="flex items-center gap-2 mb-2 px-1">
               <ClipboardList size={20} className="text-primary" />
               <h3 className="font-bold text-lg">ประวัติการดูแล</h3>
           </div>

           {/* Tabs */}
           <div className="flex gap-2 border-b border-border mb-4">
               <button 
                   onClick={() => setHistoryTab('all')}
                   className={cn(
                       "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                       historyTab === 'all' 
                           ? "border-primary text-primary" 
                           : "border-transparent text-muted-foreground hover:text-foreground"
                   )}
               >
                   📋 ทั้งหมด
               </button>
               <button 
                   onClick={() => setHistoryTab('batch')}
                   className={cn(
                       "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                       historyTab === 'batch' 
                           ? "border-primary text-primary" 
                           : "border-transparent text-muted-foreground hover:text-foreground"
                   )}
               >
                   📦 งานเหมา
               </button>
               <button 
                   onClick={() => setHistoryTab('followup')}
                   className={cn(
                       "px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                       historyTab === 'followup' 
                           ? "border-orange-500 text-orange-600" 
                           : "border-transparent text-muted-foreground hover:text-foreground"
                   )}
               >
                   ⏰ ติดตาม/นัดหมาย 
                   {logs.some(l => l.treeId === tree.id && l.status === 'IN_PROGRESS') && (
                       <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                   )}
               </button>
           </div>

           {/* Filter Bar */}
           <div className="flex gap-2 bg-card p-2 rounded-lg border shadow-sm">
               <div className="relative flex-1">
                   <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                   <Input 
                       value={historySearch}
                       onChange={(e) => setHistorySearch(e.target.value)}
                       className="pl-9 h-9 border-none bg-accent/20 focus-visible:ring-0" 
                       placeholder="ค้นหากิจกรรม..." 
                   />
               </div>
               <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={() => setHistorySort(prev => prev === 'desc' ? 'asc' : 'desc')}
                   className="gap-1 text-muted-foreground"
               >
                   <ArrowUpDown size={14} />
                   {historySort === 'desc' ? 'ใหม่-เก่า' : 'เก่า-ใหม่'}
               </Button>
           </div>

           {/* History List/Table */}
           <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
               {filteredHistory.length === 0 ? (
                   <div className="p-8 text-center text-muted-foreground">
                       ไม่พบประวัติการดูแล
                   </div>
               ) : (
                   <div className="divide-y">
                       {filteredHistory.map(log => (
                           <div 
                               key={log.id} 
                               className="p-4 hover:bg-accent/50 cursor-pointer transition-colors group"
                               onClick={() => onLogClick(log)}
                           >
                               <div className="flex justify-between items-start mb-1">
                                   <div className="flex items-center gap-2">
                                       <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                           {log.action}
                                       </span>
                                       {log.status === 'IN_PROGRESS' && (
                                           <Badge variant="outline" className="text-[10px] h-5 px-1 bg-yellow-50 text-yellow-700 border-yellow-200">
                                               รอติดตาม
                                           </Badge>
                                       )}
                                   </div>
                                   <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                                       <Clock size={12} /> {log.performDate}
                                   </span>
                               </div>
                                {log.note && (
                                   <p className="text-sm text-muted-foreground line-clamp-2">
                                        {log.note}
                                   </p>
                                )}
                           </div>
                       ))}
                   </div>
               )}
           </div>
      </div>
  );
}
