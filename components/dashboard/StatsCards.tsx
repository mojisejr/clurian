/**
 * StatsCards Component
 *
 * Displays orchard statistics in a grid layout with cards showing:
 * - Total trees count
 * - Trees requiring attention (sick)
 * - Calculated percentages
 *
 * Extracted from DashboardView to improve reusability and maintainability
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Trees, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export interface OrchardStats {
  totalTrees: number;
  healthyTrees?: number;
  sickTrees?: number;
  deadTrees?: number;
  archivedTrees?: number;
}

interface StatsCardsProps {
  stats: OrchardStats;
  className?: string;
}

export function StatsCards({ stats, className }: StatsCardsProps) {
  const { totalTrees, sickTrees = 0, healthyTrees = 0 } = stats;

  // Calculate percentages with safe division
  const sickPercentage = totalTrees > 0
    ? Math.round((sickTrees / totalTrees) * 100)
    : 0;

  const healthyPercentage = totalTrees > 0
    ? Math.round((healthyTrees / totalTrees) * 100)
    : 0;

  return (
    <div className={`grid grid-cols-2 gap-4 flex-1 ${className || ''}`}>
      {/* Total Trees Card */}
      <Card className="p-4 border shadow-sm">
        <div className="flex items-center gap-2">
          <Trees className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <div className="text-muted-foreground text-xs">ทั้งหมดในสวนนี้</div>
            <div className="text-2xl font-bold text-primary">
              {totalTrees.toLocaleString('th-TH')} ต้น
            </div>
          </div>
        </div>
      </Card>

      {/* Sick Trees Card */}
      <Card className="p-4 border shadow-sm">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <div className="flex-1">
            <div className="text-muted-foreground text-xs">ต้องดูแลพิเศษ</div>
            <div className="text-2xl font-bold text-destructive">
              {sickTrees.toLocaleString('th-TH')} ต้น
            </div>
            {totalTrees > 0 && (
              <p className="text-xs text-muted-foreground">
                {sickPercentage}% ของทั้งหมด
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Healthy Trees Card */}
      {healthyTrees > 0 && (
        <Card className="p-4 border shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div className="flex-1">
              <div className="text-muted-foreground text-xs">สมบูรณ์</div>
              <div className="text-2xl font-bold text-green-600">
                {healthyTrees.toLocaleString('th-TH')} ต้น
              </div>
              {totalTrees > 0 && (
                <p className="text-xs text-muted-foreground">
                  {healthyPercentage}% ของทั้งหมด
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Dead/Archived Trees Card - shown only if present */}
      {(stats.deadTrees && stats.deadTrees > 0) || (stats.archivedTrees && stats.archivedTrees > 0) ? (
        <Card className="p-4 border shadow-sm">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-gray-600" />
            <div className="flex-1">
              <div className="text-muted-foreground text-xs">
                {stats.deadTrees && stats.deadTrees > 0 ? 'ตาย' : 'เก็บรวบ'}
              </div>
              <div className="text-2xl font-bold text-gray-600">
                {((stats.deadTrees || 0) + (stats.archivedTrees || 0)).toLocaleString('th-TH')} ต้น
              </div>
              {totalTrees > 0 && (
                <p className="text-xs text-muted-foreground">
                  {Math.round(((stats.deadTrees || 0) + (stats.archivedTrees || 0)) / totalTrees * 100)}% ของทั้งหมด
                </p>
              )}
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}