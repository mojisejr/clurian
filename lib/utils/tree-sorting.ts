import type { Tree } from '@/lib/types';

/**
 * Extract numeric part from tree code (e.g., "T100" -> 100, "M50" -> 50)
 */
export function extractNumberFromCode(code: string): number {
  const match = code.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Extract prefix from tree code (e.g., "T100" -> "T", "M50" -> "M")
 */
export function extractPrefixFromCode(code: string): string {
  const match = code.match(/^([A-Za-z]+)/);
  return match ? match[1] : '';
}

/**
 * Define priority for tree status
 */
export function getStatusPriority(status: string): number {
  switch (status) {
    case 'sick': return 1;     // Highest priority - need attention (UI lowercase)
    case 'SICK': return 1;     // Direct database value
    case 'healthy': return 2;  // Normal (UI lowercase)
    case 'HEALTHY': return 2;  // Direct database value
    case 'dead': return 3;     // Low priority (UI lowercase)
    case 'DEAD': return 3;     // Direct database value
    case 'archived': return 4; // Lowest priority (UI lowercase)
    case 'ARCHIVED': return 4; // Direct database value
    default: return 5;
  }
}

/**
 * Sort trees by status priority, then by code prefix, then by code number
 */
export function sortTrees(trees: Tree[]): Tree[] {
  return [...trees].sort((a, b) => {
    // First, sort by status priority
    const statusPriorityA = getStatusPriority(a.status);
    const statusPriorityB = getStatusPriority(b.status);

    if (statusPriorityA !== statusPriorityB) {
      return statusPriorityA - statusPriorityB;
    }

    // If status is the same, sort by code prefix (alphabetically)
    const prefixA = extractPrefixFromCode(a.code);
    const prefixB = extractPrefixFromCode(b.code);

    if (prefixA !== prefixB) {
      return prefixA.localeCompare(prefixB);
    }

    // If prefix is the same, sort by code number (numerically)
    const numberA = extractNumberFromCode(a.code);
    const numberB = extractNumberFromCode(b.code);

    return numberA - numberB;
  });
}

/**
 * Assign running numbers to trees for display in PDF
 */
export function assignRunningNumbers(trees: Tree[]): Array<Tree & { runningNumber: number }> {
  return trees.map((tree, index) => ({
    ...tree,
    runningNumber: index + 1
  }));
}

/**
 * Get optimized sorting for PDF export
 */
export function getSortedTreesForPDF(trees: Tree[]): Array<Tree & { runningNumber: number }> {
  const sortedTrees = sortTrees(trees);
  return assignRunningNumbers(sortedTrees);
}