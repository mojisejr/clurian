"use client";

import { cn } from "@/lib/utils";
import { ZONE_FILTER_ALL } from "@/lib/constants";

export interface ZoneFilterProps {
  zones: string[];
  activeZone: string;
  onZoneChange: (zone: string) => void;
  className?: string;
}

/**
 * ZoneFilter - Horizontal scrolling zone chip selector
 *
 * @example
 * <ZoneFilter
 *   zones={["A", "B", "C"]}
 *   activeZone="All"
 *   onZoneChange={(zone) => setActiveZone(zone)}
 * />
 */
export function ZoneFilter({
  zones,
  activeZone,
  onZoneChange,
  className,
}: ZoneFilterProps) {
  const allZones = [ZONE_FILTER_ALL, ...zones];

  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto no-scrollbar py-1",
        className
      )}
    >
      {allZones.map((zone) => {
        const isActive = activeZone === zone;
        const label = zone === ZONE_FILTER_ALL ? "ทั้งหมด" : `โซน ${zone}`;

        return (
          <button
            key={zone}
            onClick={() => onZoneChange(zone)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
