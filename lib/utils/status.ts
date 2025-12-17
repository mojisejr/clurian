/**
 * Status utility functions to centralize status handling throughout the codebase.
 * These functions provide consistent status labels, colors, variants, and sorting.
 */

import { TreeStatus } from '@prisma/client';
import { STATUS_CONFIG } from '@/lib/constants';
import { getTreeStatusDisplay } from '@/lib/domain/status-display';

// Type for UI status (lowercase)
export type UITreeStatus = 'healthy' | 'sick' | 'dead' | 'archived';

// Complete status configuration with additional properties
export interface StatusConfig {
  label: string;
  color: string;
  variant: 'secondary' | 'accent' | 'destructive' | 'muted';
  order: number;
}

// Central status configuration
const STATUS_COLOR_MAP: Record<string, string> = {
  HEALTHY: 'green',
  healthy: 'green',
  SICK: 'orange',
  sick: 'orange',
  DEAD: 'red',
  dead: 'red',
  ARCHIVED: 'gray',
  archived: 'gray'
};

const STATUS_ORDER_MAP: Record<string, number> = {
  SICK: 1,
  sick: 1,
  HEALTHY: 2,
  healthy: 2,
  DEAD: 3,
  dead: 3,
  ARCHIVED: 4,
  archived: 4
};

/**
 * Gets Thai display label for tree status (both database and UI formats)
 *
 * @param status - Status value (TreeStatus or UITreeStatus)
 * @returns Thai label for display
 */
export function getStatusLabel(status: TreeStatus | UITreeStatus): string {
  return getTreeStatusDisplay(status);
}

/**
 * Gets color for status (used for styling)
 *
 * @param status - Status value
 * @returns Color string for CSS classes
 */
export function getStatusColor(status: TreeStatus | UITreeStatus | string): string {
  return STATUS_COLOR_MAP[status] || 'gray';
}

/**
 * Gets sorting order for status (lower number = higher priority)
 *
 * @param status - Status value
 * @returns Order number for sorting
 */
export function getStatusOrder(status: TreeStatus | UITreeStatus | string): number {
  return STATUS_ORDER_MAP[status] || 999;
}

/**
 * Gets priority list for tree statuses in display order
 *
 * @returns Array of TreeStatus in priority order
 */
export function getTreeStatusPriorityList(): TreeStatus[] {
  return ['SICK', 'HEALTHY', 'DEAD', 'ARCHIVED'];
}

/**
 * Gets variant for Badge component based on status
 *
 * @param status - Status value
 * @returns Badge variant
 */
export function getStatusVariant(status: TreeStatus | UITreeStatus | string): 'secondary' | 'accent' | 'destructive' | 'muted' {
  // Try to get from STATUS_CONFIG first (database status)
  if (status in STATUS_CONFIG) {
    return STATUS_CONFIG[status as TreeStatus].variant;
  }

  // Handle UI status (lowercase) by converting to uppercase
  const upperStatus = (status as string).toUpperCase();
  if (upperStatus in STATUS_CONFIG) {
    return STATUS_CONFIG[upperStatus as TreeStatus].variant;
  }

  // Return default for unknown/other statuses
  return 'muted';
}

/**
 * Gets complete status configuration object
 *
 * @param status - Status value
 * @returns Complete status configuration
 */
export function getStatusConfig(status: TreeStatus | UITreeStatus | string): StatusConfig {
  const label = getStatusLabel(status as TreeStatus | UITreeStatus);
  const color = getStatusColor(status);
  const variant = getStatusVariant(status);
  const order = getStatusOrder(status);

  return {
    label,
    color,
    variant,
    order
  };
}

/**
 * Converts UI status (lowercase) to database status (uppercase)
 *
 * @param uiStatus - UI status in lowercase
 * @returns Database status in uppercase
 */
export function uiStatusToDB(uiStatus: UITreeStatus): TreeStatus {
  const conversionMap: Record<UITreeStatus, TreeStatus> = {
    healthy: 'HEALTHY',
    sick: 'SICK',
    dead: 'DEAD',
    archived: 'ARCHIVED'
  };

  return conversionMap[uiStatus] || 'HEALTHY';
}

/**
 * Converts database status (uppercase) to UI status (lowercase)
 *
 * @param dbStatus - Database status in uppercase
 * @returns UI status in lowercase
 */
export function dbStatusToUI(dbStatus: TreeStatus): UITreeStatus {
  const conversionMap: Record<TreeStatus, UITreeStatus> = {
    HEALTHY: 'healthy',
    SICK: 'sick',
    DEAD: 'dead',
    ARCHIVED: 'archived'
  };

  return conversionMap[dbStatus] || 'healthy';
}

/**
 * Checks if status requires immediate attention
 *
 * @param status - Status value
 * @returns true if status needs attention
 */
export function isAttentionRequired(status: TreeStatus | UITreeStatus | string): boolean {
  return status === 'SICK' || status === 'sick';
}

/**
 * Checks if tree is alive (not dead or archived)
 *
 * @param status - Status value
 * @returns true if tree is alive
 */
export function isTreeAlive(status: TreeStatus | UITreeStatus | string): boolean {
  return status !== 'DEAD' && status !== 'dead' &&
         status !== 'ARCHIVED' && status !== 'archived';
}