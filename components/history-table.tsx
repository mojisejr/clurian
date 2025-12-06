"use client";

import { useState } from "react";
import { ArrowUpDown, Search, Eye, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { cn, formatThaiDate, getDaysRemaining } from "@/lib/utils";
import type { Log } from "@/lib/types";

export interface HistoryTableProps {
  logs: Log[];
  onRowClick?: (logId: number | string) => void;
  onFollowUp?: (logId: number | string) => void;
  className?: string;
}

type TabType = "all" | "followup";
type SortOrder = "asc" | "desc";

/**
 * HistoryTable - Sortable/filterable activity log table with tabs
 */
export function HistoryTable({
  logs,
  onRowClick,
  onFollowUp,
  className,
}: HistoryTableProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Filter and sort logs
  const processedLogs = logs
    .filter((log) => {
      // Tab filter
      if (activeTab === "followup") {
        if (log.status !== "in-progress" && !log.followUpDate) return false;
      }
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          log.action.toLowerCase().includes(query) ||
          log.note.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            activeTab === "all"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          ทั้งหมด
        </button>
        <button
          onClick={() => setActiveTab("followup")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            activeTab === "followup"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          รอติดตาม
        </button>
      </div>

      {/* Search & Sort Controls */}
      <div className="flex gap-2 bg-card p-2 rounded-lg border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหากิจกรรม..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSort}
          className="gap-1 h-9"
        >
          <ArrowUpDown className="h-4 w-4" />
          {sortOrder === "desc" ? "ใหม่สุด" : "เก่าสุด"}
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>วันที่</TableHead>
              <TableHead>กิจกรรม</TableHead>
              {activeTab === "followup" && (
                <TableHead>นัดติดตาม</TableHead>
              )}
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedLogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={activeTab === "followup" ? 4 : 3}
                  className="h-32 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="h-10 w-10 opacity-30" />
                    <p>ไม่พบรายการ{activeTab === "followup" ? "นัดหมาย" : "ประวัติ"}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              processedLogs.map((log) => {
                const daysRemaining = log.followUpDate
                  ? getDaysRemaining(log.followUpDate)
                  : null;

                return (
                  <TableRow
                    key={log.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onRowClick?.(log.id)}
                  >
                    <TableCell className="text-sm">
                      {formatThaiDate(log.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate max-w-[150px]">
                          {log.action}
                        </span>
                        {log.type === "batch" && (
                          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            โซน {log.zone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    {activeTab === "followup" && (
                      <TableCell>
                        {log.followUpDate && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {formatThaiDate(log.followUpDate)}
                            </span>
                            {daysRemaining && (
                              <StatusBadge
                                variant={daysRemaining.variant}
                                size="sm"
                              >
                                {daysRemaining.text}
                              </StatusBadge>
                            )}
                          </div>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowClick?.(log.id);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
