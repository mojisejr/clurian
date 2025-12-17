/**
 * FilterBar Component
 *
 * Provides search and filtering functionality for the tree list.
 * Includes:
 * - Search input for tree codes and varieties
 * - Zone filter dropdown
 * - Status filter dropdown
 * - Clear filters button
 * - Export PDF button
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Printer } from "lucide-react";

export interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterZone: string;
  onZoneChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
  onExportPDF: () => void;
  orchardZones: string[];
  totalTrees: number;
  isLoading?: boolean;
}

export function FilterBar({
  searchTerm,
  onSearchChange,
  filterZone,
  onZoneChange,
  filterStatus,
  onStatusChange,
  onClearFilters,
  onExportPDF,
  orchardZones,
  totalTrees,
  isLoading = false
}: FilterBarProps) {
  // Check if any filters are active
  const hasActiveFilters = filterZone !== 'ALL' || filterStatus !== 'ALL' || searchTerm;

  return (
    <Card className="p-3 space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
          data-testid="search-icon"
        />
        <Input
          className="pl-10"
          placeholder="ค้นหาเลขต้นหรือพันธุ์..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Filters and Actions */}
      <div className="flex justify-between items-center gap-2">
        <div className="flex gap-2 flex-1">
          {/* Zone Filter */}
          <select
            value={filterZone}
            onChange={(e) => onZoneChange(e.target.value)}
            className="text-xs px-2 py-1 border rounded"
            disabled={isLoading}
          >
            {orchardZones.map(zone => (
              <option key={zone} value={zone}>
                {zone === 'ALL' ? 'ทุกโซน' : `โซน ${zone}`}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="text-xs px-2 py-1 border rounded"
            disabled={isLoading}
          >
            <option value="ALL">ทุกสถานะ</option>
            <option value="healthy">สมบูรณ์</option>
            <option value="sick">ป่วย</option>
            <option value="dead">ตาย</option>
            <option value="archived">เก็บรวบ</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="text-xs"
              disabled={isLoading}
            >
              ล้างตัวกรอง
            </Button>
          )}

          {/* Export PDF Button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground whitespace-nowrap"
            onClick={onExportPDF}
            disabled={totalTrees === 0 || isLoading}
          >
            <Printer size={14} className="mr-1" />
            พิมพ์ QR ({totalTrees})
          </Button>
        </div>
      </div>
    </Card>
  );
}