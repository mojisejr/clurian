import type { Tree } from '@/lib/types';

/**
 * Extract numeric part from tree code (e.g., "T100" -> 100, "M50" -> 50)
 */
function extractNumberFromCode(code: string): number {
  const match = code.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Extract prefix from tree code (e.g., "T100" -> "T", "M50" -> "M")
 */
function extractPrefixFromCode(code: string): string {
  const match = code.match(/^([A-Za-z]+)/);
  return match ? match[1] : '';
}

/**
 * Define priority for tree status
 */
function getStatusPriority(status: string): number {
  switch (status) {
    case 'SICK': return 1;    // Highest priority - need attention
    case 'HEALTHY': return 2;  // Normal
    case 'DEAD': return 3;     // Low priority
    case 'ARCHIVED': return 4; // Lowest priority
    default: return 5;
  }
}

/**
 * Sort trees by:
 * 1. Status priority (SICK first, then HEALTHY, etc.)
 * 2. Tree code prefix alphabetically
 * 3. Tree code number numerically
 */
export function sortTrees(trees: Tree[]): Tree[] {
  return [...trees].sort((a, b) => {
    // First, sort by status priority
    const statusPriorityA = getStatusPriority(a.status);
    const statusPriorityB = getStatusPriority(b.status);

    if (statusPriorityA !== statusPriorityB) {
      return statusPriorityA - statusPriorityB;
    }

    // If status is the same, sort by tree code
    const prefixA = extractPrefixFromCode(a.code);
    const prefixB = extractPrefixFromCode(b.code);

    // First by prefix alphabetically
    if (prefixA !== prefixB) {
      return prefixA.localeCompare(prefixB);
    }

    // Then by number numerically
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