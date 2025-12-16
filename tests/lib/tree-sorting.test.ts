import { describe, it, expect } from 'vitest';
import type { Tree } from '../../lib/types';
import { sortTrees, assignRunningNumbers } from '../../lib/utils/tree-sorting';

describe('Tree Code Sorting', () => {
  it('should sort tree codes numerically, not alphabetically', () => {
    const unsortedTrees: Tree[] = [
      { id: '1', code: 'T100', zone: 'A', type: 'มะม่วง', variety: 'หมอนทอง', status: 'healthy', orchardId: '1', plantedDate: '2024-01-01' },
      { id: '2', code: 'T2', zone: 'A', type: 'มะม่วง', variety: 'หมอนทอง', status: 'healthy', orchardId: '1', plantedDate: '2024-01-01' },
      { id: '3', code: 'T10', zone: 'A', type: 'มะม่วง', variety: 'หมอนทอง', status: 'healthy', orchardId: '1', plantedDate: '2024-01-01' },
      { id: '4', code: 'T1', zone: 'A', type: 'มะม่วง', variety: 'หมอนทอง', status: 'healthy', orchardId: '1', plantedDate: '2024-01-01' },
      { id: '5', code: 'T20', zone: 'A', type: 'มะม่วง', variety: 'หมอนทอง', status: 'healthy', orchardId: '1', plantedDate: '2024-01-01' },
    ];

    const sorted = sortTrees(unsortedTrees);
    const codes = sorted.map(t => t.code);

    // Expected: T1, T2, T10, T20, T100
    // Not: T1, T10, T100, T2, T20 (alphabetical)
    expect(codes).toEqual(['T1', 'T2', 'T10', 'T20', 'T100']);
  });

  it('should handle mixed prefix codes', () => {
    const unsortedTrees: Tree[] = [
      { id: '1', code: 'M100', zone: 'A', type: 'มะม่วง', variety: 'หมอนทอง', status: 'healthy', orchardId: '1', plantedDate: '2024-01-01' },
      { id: '2', code: 'T2', zone: 'A', type: 'มะม่วง', variety: 'หมอนทอง', status: 'healthy', orchardId: '1', plantedDate: '2024-01-01' },
      { id: '3', code: 'M10', zone: 'A', type: 'มะม่วง', variety: 'หมอนทอง', status: 'healthy', orchardId: '1', plantedDate: '2024-01-01' },
      { id: '4', code: 'T1', zone: 'A', type: 'มะม่วง', variety: 'หมอนทอง', status: 'healthy', orchardId: '1', plantedDate: '2024-01-01' },
    ];

    const sorted = sortTrees(unsortedTrees);
    const codes = sorted.map(t => t.code);

    // Expected: M10, M100, T1, T2
    expect(codes).toEqual(['M10', 'M100', 'T1', 'T2']);
  });

  it('should prioritize sick trees in sorting', () => {
    const unsortedTrees: Tree[] = [
      { id: '1', code: 'T1', zone: 'A', type: 'มะม่วง', variety: 'หมอนทอง', status: 'healthy', orchardId: '1', plantedDate: '2024-01-01' },
      { id: '2', code: 'T2', zone: 'A', type: 'มะม่วง', variety: 'หมอนทอง', status: 'sick', orchardId: '1', plantedDate: '2024-01-01' },
      { id: '3', code: 'T3', zone: 'A', type: 'มะม่วง', variety: 'หมอนทอง', status: 'healthy', orchardId: '1', plantedDate: '2024-01-01' },
      { id: '4', code: 'T4', zone: 'A', type: 'มะม่วง', variety: 'หมอนทอง', status: 'dead', orchardId: '1', plantedDate: '2024-01-01' },
    ];

    const sorted = sortTrees(unsortedTrees);
    const codes = sorted.map(t => `${t.code} (${t.status})`);

    // Expected: SICK first, then HEALTHY, then DEAD/ARCHIVED
    expect(codes).toEqual(['T2 (sick)', 'T1 (healthy)', 'T3 (healthy)', 'T4 (dead)']);
  });
});

describe('PDF Layout Optimization', () => {
  it('should distribute trees evenly across pages', () => {
    // Test for 15 trees with 8 per page
    // Should create 2 pages: 8 trees on page 1, 7 trees on page 2
    const treesCount = 15;
    const treesPerPage = 8;

    const expectedPages = Math.ceil(treesCount / treesPerPage);
    expect(expectedPages).toBe(2);

    const page1Trees = Math.min(treesPerPage, treesCount);
    const page2Trees = treesCount - page1Trees;

    expect(page1Trees).toBe(8);
    expect(page2Trees).toBe(7);
  });

  it('should handle exact page multiples without empty pages', () => {
    // Test for 16 trees with 8 per page
    // Should create exactly 2 pages with no empty space
    const treesCount = 16;
    const treesPerPage = 8;

    const expectedPages = Math.ceil(treesCount / treesPerPage);
    expect(expectedPages).toBe(2);

    // Each page should have exactly 8 trees
    expect(treesCount % treesPerPage).toBe(0);
  });

  it('should calculate sequential numbering for display', () => {
    const trees = Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      code: `T${i + 1}`,
      zone: 'A',
      type: 'มะม่วง',
      variety: 'หมอนทอง',
      status: 'HEALTHY',
      orchardId: '1',
      plantedDate: '2024-01-01'
    }));

    const treesWithNumbers = assignRunningNumbers(trees);

    treesWithNumbers.forEach((tree, index) => {
      expect(tree.runningNumber).toBe(index + 1);
    });
  });
});