"use client";

import React, { useMemo } from 'react';
import { ClipboardList, PlusCircle, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrchard } from "@/components/providers/orchard-provider";
import { BatchActivityItem } from "@/components/dashboard/batch/batch-activity-item";
import { cn } from "@/lib/utils";

interface BatchActivitiesViewProps {
  onAddBatchLog: () => void;
}

export function BatchActivitiesView({ onAddBatchLog }: BatchActivitiesViewProps) {
  const { logs, currentOrchardId } = useOrchard();

  // Filter and sort state
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState<'desc' | 'asc'>('desc');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'completed' | 'in-progress'>('all');

  // Filter and sort batch logs
  const filteredBatchLogs = useMemo(() => {
    let result = logs.filter(log =>
      log.type === 'batch' &&
      log.orchardId === currentOrchardId
    );

    // Apply status filter
    if (statusFilter === 'completed') {
      result = result.filter(log => log.status === 'completed');
    } else if (statusFilter === 'in-progress') {
      result = result.filter(log => log.status === 'in-progress');
    }

    // Apply search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(log =>
        log.action.toLowerCase().includes(q) ||
        log.note.toLowerCase().includes(q) ||
        (log.zone && log.zone.toLowerCase().includes(q))
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [logs, currentOrchardId, statusFilter, searchTerm, sortOrder]);

  const hasActiveFilters = statusFilter !== 'all' || searchTerm;

  return (
    <div className="space-y-4">
      {/* Add Button */}
      <Button
        className="w-full gap-2"
        onClick={onAddBatchLog}
      >
        <PlusCircle size={18} /> บันทึกงานทั้งแปลง
      </Button>

      {/* Filters */}
      <div className="space-y-3">
        {/* Status Filter Pills */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-full transition-colors",
              statusFilter === 'all'
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-full transition-colors flex items-center gap-1",
              statusFilter === 'completed'
                ? "bg-green-100 text-green-700"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            เสร็จสมบูรณ์
          </button>
          <button
            onClick={() => setStatusFilter('in-progress')}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-full transition-colors flex items-center gap-1",
              statusFilter === 'in-progress'
                ? "bg-yellow-100 text-yellow-700"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            รอติดตาม
            {logs.filter(l => l.type === 'batch' && l.status === 'in-progress').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Search and Sort Bar */}
        <div className="flex gap-2 bg-card p-2 rounded-lg border shadow-sm">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 border-none bg-accent/20 focus-visible:ring-0"
              placeholder="ค้นหางานทั้งแปลง..."
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="gap-1 text-muted-foreground"
          >
            <ArrowUpDown size={14} />
            {sortOrder === 'desc' ? 'ใหม่-เก่า' : 'เก่า-ใหม่'}
          </Button>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        {filteredBatchLogs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <ClipboardList className="mx-auto mb-4 opacity-50" size={48} />
            {hasActiveFilters ? (
              <div>
                <p className="text-lg font-medium">ไม่พบงานที่ตรงกับเงื่อนไข</p>
                <p className="text-sm mt-1">ลองลบหรือปรับเปลี่ยนตัวกรองเพื่อดูรายการอื่น</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium">ยังไม่มีบันทึกงานทั้งแปลง</p>
                <p className="text-sm mt-1">กดปุ่ม &quot;บันทึกงานทั้งแปลง&quot; เพื่อเพิ่มบันทึกใหม่</p>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {filteredBatchLogs.map(log => (
              <BatchActivityItem
                key={log.id}
                log={log}
                onClick={(log) => {
                  // TODO: Implement modal or navigation to log details
                  console.log('Batch log clicked:', log);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t text-center text-xs text-muted-foreground">
        CLURIAN: Orchard Manager v1.1
        {filteredBatchLogs.length > 0 && (
          <span className="ml-2">
            แสดง {filteredBatchLogs.length} รายการ
          </span>
        )}
      </div>
    </div>
  );
}