import { TreeStatus } from '@prisma/client';
import { UITreeStatus } from '@/lib/types';

/**
 * Convert UI status (lowercase) to Database status (uppercase)
 * Handles null/undefined values gracefully
 */
export function convertUIStatusToDB(status?: string | null): TreeStatus | undefined {
  if (!status) return undefined;

  const upperStatus = status.toUpperCase();

  // Validate that it's a valid TreeStatus
  const validStatuses: TreeStatus[] = ['HEALTHY', 'SICK', 'DEAD', 'ARCHIVED'];

  if (validStatuses.includes(upperStatus as TreeStatus)) {
    return upperStatus as TreeStatus;
  }

  // Return undefined for invalid status
  return undefined;
}

/**
 * Convert Database status (uppercase) to UI status (lowercase)
 */
export function convertDBStatusToUI(status: TreeStatus): UITreeStatus {
  return status.toLowerCase() as UITreeStatus;
}

/**
 * Validate if a string is a valid UI status
 */
export function isValidUIStatus(status: string): status is UITreeStatus {
  const validStatuses: UITreeStatus[] = ['healthy', 'sick', 'dead', 'archived'];
  return validStatuses.includes(status as UITreeStatus);
}

/**
 * Validate if a string is a valid Database status
 */
export function isValidDBStatus(status: string): status is TreeStatus {
  const validStatuses: TreeStatus[] = ['HEALTHY', 'SICK', 'DEAD', 'ARCHIVED'];
  return validStatuses.includes(status as TreeStatus);
}

/**
 * Safe status conversion that handles various input cases
 */
export function normalizeStatus(status?: string | null): TreeStatus | undefined {
  if (!status) return undefined;

  // Try to convert to DB status
  return convertUIStatusToDB(status);
}