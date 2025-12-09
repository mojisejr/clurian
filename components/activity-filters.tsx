"use client";

import { Search, Filter, Calendar, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useState } from "react";

interface ActivityFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedZone: string;
  onZoneChange: (value: string) => void;
  selectedActivity: string;
  onActivityChange: (value: string) => void;
  dateRange: "all" | "today" | "week" | "month" | "custom";
  onDateRangeChange: (value: "all" | "today" | "week" | "month" | "custom") => void;
  zones: string[];
  activities: string[];
  isFiltered: boolean;
  onClearFilters: () => void;
}

export function ActivityFilters({
  searchQuery,
  onSearchChange,
  selectedZone,
  onZoneChange,
  selectedActivity,
  onActivityChange,
  dateRange,
  onDateRangeChange,
  zones,
  activities,
  isFiltered,
  onClearFilters,
}: ActivityFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeFiltersCount = [
    selectedZone !== "all" ? 1 : 0,
    selectedActivity !== "all" ? 1 : 0,
    dateRange !== "all" ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-3">
      {/* Search and Filter Header */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="ค้นหาจากหมายเหตุ..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="w-4 h-4 mr-2" />
              ตัวกรอง
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">โซน</h4>
                <Select value={selectedZone} onValueChange={onZoneChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกโซน" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกโซน</SelectItem>
                    {zones.map((zone) => (
                      <SelectItem key={zone} value={zone}>
                        {zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">ประเภทกิจกรรม</h4>
                <Select value={selectedActivity} onValueChange={onActivityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกกิจกรรม" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกกิจกรรม</SelectItem>
                    {activities.map((activity) => (
                      <SelectItem key={activity} value={activity}>
                        {activity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">ช่วงเวลา</h4>
                <Select value={dateRange} onValueChange={onDateRangeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกช่วงเวลา" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกช่วงเวลา</SelectItem>
                    <SelectItem value="today">วันนี้</SelectItem>
                    <SelectItem value="week">7 วันล่าสุด</SelectItem>
                    <SelectItem value="month">30 วันล่าสุด</SelectItem>
                    <SelectItem value="custom">กำหนดเอง</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isFiltered && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="w-full"
                >
                  ล้างตัวกรองทั้งหมด
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {isFiltered && (
        <div className="flex flex-wrap gap-2">
          {selectedZone !== "all" && (
            <Badge variant="secondary" className="gap-1">
              โซน: {selectedZone}
            </Badge>
          )}
          {selectedActivity !== "all" && (
            <Badge variant="secondary" className="gap-1">
              กิจกรรม: {selectedActivity}
            </Badge>
          )}
          {dateRange !== "all" && (
            <Badge variant="secondary" className="gap-1">
              <Calendar className="w-3 h-3" />
              {dateRange === "today" && "วันนี้"}
              {dateRange === "week" && "7 วันล่าสุด"}
              {dateRange === "month" && "30 วันล่าสุด"}
              {dateRange === "custom" && "กำหนดเอง"}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}