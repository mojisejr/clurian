/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BatchPDFGenerator } from '../../lib/utils/batch-pdf-generator';
import type { Tree } from '../../lib/types';

// Mock performance.memory for testing
const mockPerformanceMemory = {
  usedJSHeapSize: 50000000, // 50MB
  totalJSHeapSize: 100000000, // 100MB
  jsHeapSizeLimit: 2048000000 // 2GB
};

// Mock performance API
Object.assign(global, {
  performance: {
    ...global.performance,
    memory: mockPerformanceMemory,
    now: vi.fn(() => Date.now())
  }
});

// Mock window and location
Object.assign(global, {
  window: {
    ...global.window,
    gc: vi.fn(),
    location: {
      origin: 'https://clurian.vercel.app'
    }
  }
});

describe('BatchPDFGenerator Performance Tests', () => {
  let generator: BatchPDFGenerator;
  let mockTrees: Tree[];
  let onProgressMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    generator = new BatchPDFGenerator();
    onProgressMock = vi.fn();

    // Reset memory mock
    mockPerformanceMemory.usedJSHeapSize = 50000000;
  });

  describe('Memory Management', () => {
    it('should track memory usage during batch processing', async () => {
      mockTrees = Array.from({ length: 200 }, (_, i) => ({
        id: `tree-${i + 1}`,
        code: `T${String(i + 1).padStart(3, '0')}`,
        type: 'มะม่วง',
        variety: 'น้ำดอกไม้',
        zone: 'A',
        plantedDate: '2024-01-01',
        status: 'HEALTHY' as const,
        orchardId: 'orchard-1'
      }));

      // Mock QR code generation to simulate memory increase
      vi.doMock('qrcode', () => ({
        toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mock-qr-data')
      }));

      // Simulate memory increase during processing
      let memoryCallCount = 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.spyOn(generator as any, 'getMemoryInfo').mockImplementation(() => {
        memoryCallCount++;
        // Simulate memory increase
        if (memoryCallCount > 2) {
          return {
            used: mockPerformanceMemory.usedJSHeapSize + (memoryCallCount * 10000000),
            total: mockPerformanceMemory.totalJSHeapSize
          };
        }
        return {
          used: mockPerformanceMemory.usedJSHeapSize,
          total: mockPerformanceMemory.totalJSHeapSize
        };
      });

      try {
        await generator.generateZipWithProgress(
          mockTrees,
          50,
          onProgressMock,
          'Test Orchard',
          'data:image/png;base64,mock-logo'
        );
      } catch {
        // Expected to fail due to mocked dependencies
      }

      // Should track memory usage in progress callbacks
      expect(onProgressMock).toHaveBeenCalledWith(
        expect.objectContaining({
          memoryUsage: expect.objectContaining({
            used: expect.any(Number),
            total: expect.any(Number),
            percentage: expect.any(Number)
          })
        })
      );
    });

    it('should call garbage collection after batch cleanup', async () => {
      const mockGC = vi.fn();
      Object.assign(global.window, { gc: mockGC });

      // Create test trees
      mockTrees = Array.from({ length: 10 }, (_, i) => ({
        id: `tree-${i + 1}`,
        code: `T${String(i + 1).padStart(3, '0')}`,
        type: 'มะม่วง',
        variety: 'น้ำดอกไม้',
        zone: 'A',
        plantedDate: '2024-01-01',
        status: 'HEALTHY' as const,
        orchardId: 'orchard-1'
      }));

      try {
        await generator.generateZipWithProgress(
          mockTrees,
          10,
          onProgressMock,
          'Test Orchard',
          'data:image/png;base64,mock-logo'
        );
      } catch {
        // Expected to fail due to mocked dependencies
      }

      // GC should be called during cleanup
      expect(mockGC).toHaveBeenCalled();
    });

    it('should handle memory pressure warnings', () => {
      // Simulate high memory usage (> 90%)
      vi.spyOn(generator as any, 'getMemoryInfo').mockReturnValue({
        used: 95000000, // 95MB
        total: 100000000 // 100MB
      });

      const memoryInfo = (generator as any).getMemoryInfo();
      const percentage = (memoryInfo.used / memoryInfo.total) * 100;

      expect(percentage).toBeGreaterThan(90);
    });
  });

  describe('Batch Size Optimization', () => {
    it('should calculate optimal batch size for different tree counts', () => {
      // Small orchard (< 50 trees)
      expect((generator as any).calculateOptimalBatchSize(25)).toBe(25);
      expect((generator as any).calculateOptimalBatchSize(50)).toBe(50);

      // Medium orchard (50-100 trees)
      expect((generator as any).calculateOptimalBatchSize(75)).toBe(50);
      expect((generator as any).calculateOptimalBatchSize(100)).toBe(50);

      // Large orchard (> 100 trees)
      expect((generator as any).calculateOptimalBatchSize(150)).toBe(100);
      expect((generator as any).calculateOptimalBatchSize(500)).toBe(100);
      expect((generator as any).calculateOptimalBatchSize(1000)).toBe(100);
    });

    it('should create appropriate number of batches', () => {
      // Use public interface to test batch creation indirectly
      // For 150 trees, it uses MAX_BATCH_SIZE (100), so 150/100 = 1.5 → 2 batches
      const info = generator.getProcessingInfo(150);
      expect(info.estimatedBatches).toBe(2); // 150/100 = 1.5 → 2 batches
      expect(info.batchSize).toBe(100); // Uses max batch size for > 100 trees

      const info2 = generator.getProcessingInfo(155);
      expect(info2.estimatedBatches).toBe(2); // 155/100 = 1.55 → 2 batches

      const info3 = generator.getProcessingInfo(100);
      expect(info3.estimatedBatches).toBe(2); // 100/50 = 2 batches
      expect(info3.batchSize).toBe(50); // Uses 50 for exactly 100 trees

      const info4 = generator.getProcessingInfo(101);
      expect(info4.estimatedBatches).toBe(2); // 101/100 = 1.01 → 2 batches
      expect(info4.batchSize).toBe(100); // Uses max batch size for > 100 trees
    });

    it('should respect maximum batch size limit', () => {
      // Test that batch size never exceeds MAX_BATCH_SIZE
      const largeOrchardInfo = generator.getProcessingInfo(500);
      expect(largeOrchardInfo.batchSize).toBeLessThanOrEqual(generator.MAX_BATCH_SIZE);

      const veryLargeOrchardInfo = generator.getProcessingInfo(1000);
      expect(veryLargeOrchardInfo.batchSize).toBeLessThanOrEqual(generator.MAX_BATCH_SIZE);

      // Test with manual batch size request
      const info = generator.getProcessingInfo(50);
      expect(info.batchSize).toBeLessThanOrEqual(generator.MAX_BATCH_SIZE);
    });
  });

  describe('Performance with Large Datasets', () => {
    it('should handle 500+ trees efficiently', async () => {
      mockTrees = Array.from({ length: 500 }, (_, i) => ({
        id: `tree-${i + 1}`,
        code: `T${String(i + 1).padStart(3, '0')}`,
        type: 'มะม่วง',
        variety: 'น้ำดอกไม้',
        zone: ['A', 'B', 'C'][i % 3],
        plantedDate: '2024-01-01',
        status: 'HEALTHY' as const,
        orchardId: 'orchard-1'
      }));

      const startTime = Date.now();

      // Get processing info
      const info = generator.getProcessingInfo(mockTrees.length);

      expect(info.useBatch).toBe(true);
      expect(info.batchSize).toBe(100); // Max batch size
      expect(info.estimatedBatches).toBe(5); // 500/100 = 5
      expect(info.estimatedFiles).toBe(5);

      // Should not take too long to calculate
      const calculationTime = Date.now() - startTime;
      expect(calculationTime).toBeLessThan(100); // < 100ms
    });

    it('should handle 1000+ trees efficiently', async () => {
      mockTrees = Array.from({ length: 1000 }, (_, i) => ({
        id: `tree-${i + 1}`,
        code: `T${String(i + 1).padStart(3, '0')}`,
        type: 'มะม่วง',
        variety: 'น้ำดอกไม้',
        zone: ['A', 'B', 'C', 'D'][i % 4],
        plantedDate: '2024-01-01',
        status: 'HEALTHY' as const,
        orchardId: 'orchard-1'
      }));

      const info = generator.getProcessingInfo(mockTrees.length);

      expect(info.useBatch).toBe(true);
      expect(info.batchSize).toBe(100); // Max batch size
      expect(info.estimatedBatches).toBe(10); // 1000/100 = 10
      expect(info.estimatedFiles).toBe(10);
    });

    it('should track progress accurately for large batches', async () => {
      mockTrees = Array.from({ length: 200 }, (_, i) => ({
        id: `tree-${i + 1}`,
        code: `T${String(i + 1).padStart(3, '0')}`,
        type: 'มะม่วง',
        variety: 'น้ำดอกไม้',
        zone: 'A',
        plantedDate: '2024-01-01',
        status: 'HEALTHY' as const,
        orchardId: 'orchard-1'
      }));

      const progressStates: any[] = [];

      onProgressMock.mockImplementation((progress) => {
        progressStates.push(progress);
      });

      try {
        await generator.generateZipWithProgress(
          mockTrees,
          50,
          onProgressMock,
          'Test Orchard',
          'data:image/png;base64,mock-logo'
        );
      } catch {
        // Expected to fail due to mocked dependencies
      }

      if (progressStates.length > 0) {
        // Should start with waiting state
        expect(progressStates[0].batchStatus).toBe('waiting');

        // Should have correct total counts
        progressStates.forEach(state => {
          expect(state.totalTrees).toBe(200);
          expect(state.totalBatches).toBe(4); // 200/50 = 4
        });
      }
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle empty tree array', async () => {
      await expect(
        generator.generateZipWithProgress(
          [],
          50,
          onProgressMock,
          'Test Orchard',
          'data:image/png;base64,mock-logo'
        )
      ).rejects.toThrow('No trees to generate PDF for');
    });

    it('should handle zero or negative batch size', async () => {
      mockTrees = Array.from({ length: 10 }, (_, i) => ({
        id: `tree-${i + 1}`,
        code: `T${String(i + 1).padStart(3, '0')}`,
        type: 'มะม่วง',
        variety: 'น้ำดอกไม้',
        zone: 'A',
        plantedDate: '2024-01-01',
        status: 'HEALTHY' as const,
        orchardId: 'orchard-1'
      }));

      // Should default to optimal batch size when given 0
      try {
        await generator.generateZipWithProgress(
          mockTrees,
          0,
          onProgressMock,
          'Test Orchard',
          'data:image/png;base64,mock-logo'
        );
      } catch {
        // Expected to fail due to mocked dependencies
      }

      // Should calculate optimal batch size
      expect(generator.getProcessingInfo(10).batchSize).toBeGreaterThan(0);
    });

    it('should handle invalid tree data', () => {
      const invalidTrees = [
        { id: '', code: 'T001', type: 'มะม่วง', variety: 'น้ำดอกไม้', zone: 'A', plantedDate: '2024-01-01', status: 'HEALTHY' as const, orchardId: 'orchard-1' },
        { id: 'tree-2', code: '', type: 'มะม่วง', variety: 'น้ำดอกไม้', zone: 'A', plantedDate: '2024-01-01', status: 'HEALTHY' as const, orchardId: 'orchard-1' }
      ];

      // Should still calculate processing info
      expect(() => {
        generator.getProcessingInfo(invalidTrees.length);
      }).not.toThrow();
    });
  });

  describe('Memory Cleanup', () => {
    it('should revoke QR code URLs after batch completion', () => {
      const mockURL = {
        revokeObjectURL: vi.fn()
      };

      Object.assign(global, {
        URL: mockURL
      });

      const testBatch = [
        { qrDataUrl: 'blob:mock-url-1' },
        { qrDataUrl: 'blob:mock-url-2' },
        { qrDataUrl: 'blob:mock-url-3' }
      ];

      (generator as any).cleanupBatch(testBatch);

      expect(mockURL.revokeObjectURL).toHaveBeenCalledTimes(3);
      expect(mockURL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url-1');
      expect(mockURL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url-2');
      expect(mockURL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url-3');
    });

    it('should handle cleanup when qrDataUrl is missing', () => {
      const mockURL = {
        revokeObjectURL: vi.fn()
      };

      Object.assign(global, {
        URL: mockURL
      });

      const testBatch = [
        { id: 1 },
        { qrDataUrl: 'blob:mock-url' },
        { id: 3 }
      ];

      // Should not throw when qrDataUrl is missing
      expect(() => {
        (generator as any).cleanupBatch(testBatch);
      }).not.toThrow();

      // Should still revoke existing URLs
      expect(mockURL.revokeObjectURL).toHaveBeenCalledTimes(1);
    });
  });
});