"use client";

import React, { useMemo, useState } from 'react';
import {
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ChevronDown,
  RotateCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useOrchard } from "@/components/providers/orchard-provider";
import { useOrchardActivityLogs, useOrchardTrees } from '@/lib/hooks/use-orchard-queries';
import { useInvalidateOrchardData } from '@/lib/hooks/use-orchard-queries';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { LogDetailModal } from "@/components/modals/log-detail-modal";
import { FollowUpModal, type FollowUpResult } from "@/components/modals/follow-up-modal";
import { cn } from "@/lib/utils";
import type { Log } from "@/lib/types";
import {
  groupActivitiesByDate,
  formatDateThaiFull,
  getRelativeDateLabel
} from "@/lib/date-utils";

type ScheduledActivitiesViewProps = Record<string, never>;

export function ScheduledActivitiesView({}: ScheduledActivitiesViewProps) {
  // React Query for logs and trees data
  const { currentOrchardId, updateLogs } = useOrchard();

  const { data: logsData, isLoading: isLoadingLogs, error: logsError, refetch: refetchLogs } = useOrchardActivityLogs(currentOrchardId, {
    page: 1,
    limit: 1000,
    filters: {}
  });

  const { data: treesData, isLoading: isLoadingTrees } = useOrchardTrees(currentOrchardId, {
    page: 1,
    limit: 1000,
    filters: {}
  });

  const logs = useMemo(() => logsData?.logs || [], [logsData?.logs]);
  const trees = useMemo(() => treesData?.trees || [], [treesData?.trees]);

  const { invalidateActivityLogs } = useInvalidateOrchardData();

  const handleRefresh = async () => {
    await invalidateActivityLogs(currentOrchardId);
  };

  const isLoading = isLoadingLogs || isLoadingTrees;
  const error = logsError;

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [showLogDetail, setShowLogDetail] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    overdue: true,
    today: true,
    upcoming: true
  });

  // Get unique zones from current orchard
  const availableZones = useMemo(() => {
    const zones = new Set(trees.map(tree => tree.zone));
    return Array.from(zones).sort();
  }, [trees]);

  // Filter logs with follow-up dates
  const scheduledActivities = useMemo(() => {
    return logs.filter(log =>
      log.orchardId === currentOrchardId &&
      log.followUpDate &&
      log.status === 'IN_PROGRESS'
    );
  }, [logs, currentOrchardId]);

  // Group activities by date status
  const groupedActivities = useMemo(() => {
    let activities = scheduledActivities;

    // Apply zone filter
    if (zoneFilter !== 'all') {
      activities = activities.filter(log => {
        if (log.logType === 'BATCH' && log.targetZone) {
          return log.targetZone === zoneFilter;
        } else if (log.logType === 'INDIVIDUAL' && log.treeId) {
          const tree = trees.find(t => t.id === log.treeId);
          return tree?.zone === zoneFilter;
        }
        return false;
      });
    }

    // Apply search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      activities = activities.filter(log => {
        // Search in action and note
        if (log.action.toLowerCase().includes(q) ||
            (log.note && log.note.toLowerCase().includes(q))) {
          return true;
        }

        // Search in tree code or zone
        if (log.logType === 'INDIVIDUAL' && log.treeId) {
          const tree = trees.find(t => t.id === log.treeId);
          if (tree && (tree.code.toLowerCase().includes(q) ||
                       tree.zone.toLowerCase().includes(q))) {
            return true;
          }
        }

        // Search in target zone for batch logs
        if (log.logType === 'BATCH' && log.targetZone &&
            log.targetZone.toLowerCase().includes(q)) {
          return true;
        }

        return false;
      });
    }

    return groupActivitiesByDate(activities);
  }, [scheduledActivities, zoneFilter, searchTerm, trees]);

  // Get tree info for individual logs
  const getTreeInfo = (log: Log) => {
    if (log.logType === 'INDIVIDUAL' && log.treeId) {
      return trees.find(t => t.id === log.treeId);
    }
    return null;
  };

  // Handle log click
  const handleLogClick = (log: Log) => {
    setSelectedLog(log);
    setShowLogDetail(true);
  };

  // Handle follow-up
  const handleFollowUp = () => {
    setShowLogDetail(false);
    setShowFollowUp(true);
  };

  // Handle follow-up submit
  const handleFollowUpSubmit = async (result: FollowUpResult) => {
    if (!selectedLog) return;

    const today = new Date().toISOString().split('T')[0];

    // Mark the original log as completed
    const updatedLogs = logs.map(l =>
      l.id === selectedLog.id ? { ...l, status: 'COMPLETED' as const } : l
    );

    if (result.type === 'cured') {
      // Create a cured log
      const curedLog: Log = {
        id: `temp-${Date.now()}`,
        orchardId: currentOrchardId,
        logType: selectedLog.logType,
        treeId: selectedLog.treeId,
        targetZone: selectedLog.targetZone,
        action: `ติดตามผล: ${selectedLog.action}`,
        note: `[จบเคส] อาการดีขึ้น/หายแล้ว - ${result.note}`,
        performDate: today,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
      };

      updateLogs([curedLog, ...updatedLogs]);
    } else {
      // Create a continue treatment log
      const continueLog: Log = {
        id: `temp-${Date.now()}`,
        orchardId: currentOrchardId,
        logType: selectedLog.logType,
        treeId: selectedLog.treeId,
        targetZone: selectedLog.targetZone,
        action: `ดำเนินการต่อ: ${selectedLog.action}`,
        note: `[ยังไม่หาย] ${result.note}`,
        performDate: today,
        status: 'IN_PROGRESS',
        followUpDate: result.nextDate,
        createdAt: new Date().toISOString(),
      };

      updateLogs([continueLog, ...updatedLogs]);
    }

    setShowFollowUp(false);
    setSelectedLog(null);
  };

  // Handle log detail close
  const handleLogDetailClose = () => {
    setShowLogDetail(false);
    setSelectedLog(null);
  };

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Activity Card Component
  const ActivityCard = ({ log, priority }: { log: Log; priority: 'overdue' | 'today' | 'upcoming' }) => {
    const treeInfo = getTreeInfo(log);
    const isOverdue = priority === 'overdue';
    const isToday = priority === 'today';

    return (
      <div
        onClick={() => handleLogClick(log)}
        className={cn(
          "p-4 bg-card border-l-4 hover:bg-accent/50 transition-colors cursor-pointer",
          isOverdue && "border-l-red-500 bg-red-50/50 dark:bg-red-950/20",
          isToday && "border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20",
          priority === 'upcoming' && "border-l-green-500"
        )}
      >
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {log.logType === 'BATCH' ? 'ทั้งแปลง' : 'รายต้น'}
                </Badge>
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle size={10} className="mr-1" />
                    เลยกำหนด
                  </Badge>
                )}
                {isToday && (
                  <Badge variant="secondary" className="text-xs">
                    <Clock size={10} className="mr-1" />
                    วันนี้
                  </Badge>
                )}
              </div>
              <h3 className="font-medium">{log.action}</h3>
            </div>
            <ChevronDown size={16} className="text-muted-foreground" />
          </div>

          {/* Details */}
          <div className="space-y-1 text-sm text-muted-foreground">
            {treeInfo && (
              <p>
                ต้นไม้: <span className="font-medium text-foreground">{treeInfo.code}</span>
                {` (${treeInfo.zone})`}
              </p>
            )}
            {log.logType === 'BATCH' && log.targetZone && (
              <p>
                โซน: <span className="font-medium text-foreground">{log.targetZone}</span>
              </p>
            )}
            <p>
              นัดหมาย: <span className="font-medium text-foreground">
                {formatDateThaiFull(log.followUpDate!)}
              </span>
              <span className="ml-2 text-xs">
                ({getRelativeDateLabel(log.followUpDate!)})
              </span>
            </p>
            {log.note && (
              <p className="text-xs">หมายเหตุ: {log.note}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar size={20} />
              งานที่ต้องทำ
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              ติดตามงานที่มีนัดหมาย
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            aria-label="รีเฟรชกิจกรรมที่ต้องทำ"
            title="ดึงข้อมูลล่าสุดจากเซิร์ฟเวอร์"
          >
            <RotateCw size={16} />
            <span className="hidden sm:inline">รีเฟรช</span>
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-destructive/15 border border-destructive/20 text-destructive p-4 rounded-lg">
            <p className="text-sm">เกิดข้อผิดพลาดในการโหลดข้อมูล: {error.message}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchLogs()}
              className="mt-2"
            >
              ลองใหม่
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <RotateCw size={24} className="animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">กำลังโหลดข้อมูล...</span>
          </div>
        )}

      {/* Filters - Only show when not loading */}
      {!isLoading && (
        <div className="flex gap-2 flex-wrap">
          {/* Zone Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter size={14} />
                {zoneFilter === 'all' ? 'ทุกโซน' : `โซน: ${zoneFilter}`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setZoneFilter('all')}>
                ทุกโซน
              </DropdownMenuItem>
              {availableZones.map(zone => (
                <DropdownMenuItem key={zone} onClick={() => setZoneFilter(zone)}>
                  โซน {zone}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
              placeholder="ค้นหา..."
            />
          </div>
        </div>
      )}

      {/* Activity Groups - Only show when not loading */}
      {!isLoading && !error && (
      <div className="space-y-4">
        {/* Overdue */}
        {groupedActivities.overdue.length > 0 && (
          <div className="bg-card rounded-xl border overflow-hidden">
            <button
              onClick={() => toggleSection('overdue')}
              className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-red-500" />
                <span className="font-medium text-red-700">
                  เลยกำหนด ({groupedActivities.overdue.length})
                </span>
              </div>
              <ChevronDown
                size={16}
                className={cn(
                  "text-muted-foreground transition-transform",
                  !expandedSections.overdue && "rotate-180"
                )}
              />
            </button>
            {expandedSections.overdue && (
              <div className="divide-y">
                {groupedActivities.overdue.map(log => (
                  <ActivityCard key={log.id} log={log} priority="overdue" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Today */}
        {groupedActivities.today.length > 0 && (
          <div className="bg-card rounded-xl border overflow-hidden">
            <button
              onClick={() => toggleSection('today')}
              className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-yellow-500" />
                <span className="font-medium text-yellow-700">
                  วันนี้ ({groupedActivities.today.length})
                </span>
              </div>
              <ChevronDown
                size={16}
                className={cn(
                  "text-muted-foreground transition-transform",
                  !expandedSections.today && "rotate-180"
                )}
              />
            </button>
            {expandedSections.today && (
              <div className="divide-y">
                {groupedActivities.today.map(log => (
                  <ActivityCard key={log.id} log={log} priority="today" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upcoming */}
        {groupedActivities.upcoming.length > 0 && (
          <div className="bg-card rounded-xl border overflow-hidden">
            <button
              onClick={() => toggleSection('upcoming')}
              className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-500" />
                <span className="font-medium text-green-700">
                  ที่จะถึง ({groupedActivities.upcoming.length})
                </span>
              </div>
              <ChevronDown
                size={16}
                className={cn(
                  "text-muted-foreground transition-transform",
                  !expandedSections.upcoming && "rotate-180"
                )}
              />
            </button>
            {expandedSections.upcoming && (
              <div className="divide-y">
                {groupedActivities.upcoming.map(log => (
                  <ActivityCard key={log.id} log={log} priority="upcoming" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {groupedActivities.overdue.length === 0 &&
         groupedActivities.today.length === 0 &&
         groupedActivities.upcoming.length === 0 && (
          <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
            <CheckCircle2 className="mx-auto mb-2 opacity-50" size={48} />
            <p className="text-lg font-medium">ไม่มีงานที่ต้องทำ</p>
            <p className="text-sm mt-1">
              {scheduledActivities.length === 0
                ? "ไม่มีนัดหมายที่รอติดตามในขณะนี้"
                : "ลองปรับเปลี่ยนตัวกรองเพื่อดูรายการอื่น"}
            </p>
          </div>
        )}
      </div>
      )}

      {/* Footer - Only show when not loading */}
      {!isLoading && !error && (
        <div className="pt-4 border-t text-center text-xs text-muted-foreground">
          CLURIAN: Orchard Manager v1.1
          <span className="ml-2">
            ทั้งหมด {scheduledActivities.length} รายการ
          </span>
        </div>
      )}

      {/* Log Detail Modal */}
      {selectedLog && (
        <LogDetailModal
          log={selectedLog}
          open={showLogDetail}
          onClose={handleLogDetailClose}
          onFollowUp={handleFollowUp}
        />
      )}

      {/* Follow Up Modal */}
      {selectedLog && (
        <FollowUpModal
          log={selectedLog}
          open={showFollowUp}
          onClose={() => {
            setShowFollowUp(false);
            setSelectedLog(null);
          }}
          onSubmit={handleFollowUpSubmit}
        />
      )}
      </div>
    </PullToRefresh>
  );
}