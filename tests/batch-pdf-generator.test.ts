import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BatchPDFGenerator } from '../lib/utils/batch-pdf-generator';
import type { Tree } from '../lib/types';

// Mock dependencies
vi.mock('@react-pdf/renderer', () => ({
  pdf: vi.fn(() => ({
    toBlob: vi.fn(() => Promise.resolve(new Blob(['PDF content'], { type: 'application/pdf' })))
  })),
  Font: {
    register: vi.fn()
  },
  StyleSheet: {
    create: vi.fn((styles: Record<string, unknown>) => styles)
  },
  Document: vi.fn(({ children }: { children: React.ReactNode }) => ({ type: 'Document', children })),
  Page: vi.fn(({ children, size, style }: { children: React.ReactNode; size: string; style: Record<string, unknown> }) => ({
    type: 'Page',
    children,
    size,
    style
  })),
  View: vi.fn(({ children, style }: { children: React.ReactNode; style: Record<string, unknown> }) => ({
    type: 'View',
    children,
    style
  })),
  Text: vi.fn(({ children, style }: { children: React.ReactNode; style: Record<string, unknown> }) => ({
    type: 'Text',
    children,
    style
  })),
  Image: vi.fn(({ src, style }: { src: string; style: Record<string, unknown> }) => ({
    type: 'Image',
    src,
    style
  }))
}));

vi.mock('jszip', () => ({
  default: class {
    file = vi.fn();
    generateAsync = vi.fn(() => Promise.resolve(new Blob(['ZIP content'], { type: 'application/zip' })));
  }
}));

vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(() => Promise.resolve('data:image/png;base64,mock-qr-code'))
  }
}));

describe('BatchPDFGenerator', () => {
  let batchGenerator: BatchPDFGenerator;
  let mockTrees: Tree[];
  let mockOrchardName: string;
  let mockLogoBase64: string;

  beforeEach(() => {
    batchGenerator = new BatchPDFGenerator();
    mockTrees = Array.from({ length: 150 }, (_, i) => ({
      id: `tree-${i + 1}`,
      code: `T${String(i + 1).padStart(3, '0')}`,
      type: 'มะม่วง',
      variety: 'น้ำดอกไม้',
      zone: 'A',
      plantedDate: '2024-01-01',
      status: 'HEALTHY' as const,
      orchardId: 'orchard-1'
    }));
    mockOrchardName = 'Test Orchard';
    mockLogoBase64 = 'data:image/png;base64,mock-logo';
  });

  describe('calculateOptimalBatchSize', () => {
    it('should return tree count for small orchards (< 50 trees)', () => {
      const smallOrchard = mockTrees.slice(0, 25);
      expect(batchGenerator['calculateOptimalBatchSize'](smallOrchard.length)).toBe(25);
    });

    it('should return 50 for medium orchards (50-100 trees)', () => {
      const mediumOrchard = mockTrees.slice(0, 75);
      expect(batchGenerator['calculateOptimalBatchSize'](mediumOrchard.length)).toBe(50);
    });

    it('should return 100 for large orchards (> 100 trees)', () => {
      expect(batchGenerator['calculateOptimalBatchSize'](mockTrees.length)).toBe(100);
    });

    it('should handle edge case of exactly 50 trees', () => {
      const exactOrchard = mockTrees.slice(0, 50);
      expect(batchGenerator['calculateOptimalBatchSize'](exactOrchard.length)).toBe(50);
    });
  });

  describe('createBatches', () => {
    it('should create single batch for small orchards', () => {
      const smallOrchard = mockTrees.slice(0, 25);
      const batches = batchGenerator['createBatches'](smallOrchard, 25);

      expect(batches).toHaveLength(1);
      expect(batches[0]).toHaveLength(25);
    });

    it('should create multiple batches for large orchards', () => {
      const batches = batchGenerator['createBatches'](mockTrees, 50);

      expect(batches).toHaveLength(3);
      expect(batches[0]).toHaveLength(50);
      expect(batches[1]).toHaveLength(50);
      expect(batches[2]).toHaveLength(50);
    });

    it('should handle remainder trees in last batch', () => {
      const unevenOrchard = mockTrees.slice(0, 125);
      const batches = batchGenerator['createBatches'](unevenOrchard, 50);

      expect(batches).toHaveLength(3);
      expect(batches[0]).toHaveLength(50);
      expect(batches[1]).toHaveLength(50);
      expect(batches[2]).toHaveLength(25);
    });
  });

  describe('generateZipWithProgress', () => {
    it('should call progress callback for each batch', async () => {
      const progressCallback = vi.fn();

      await batchGenerator.generateZipWithProgress(
        mockTrees,
        50,
        progressCallback,
        mockOrchardName,
        mockLogoBase64
      );

      // Should be called: 1 initial + (2 * number of batches) [start + complete]
      const expectedCalls = 1 + (2 * 3); // 3 batches for 150 trees with batch size 50
      expect(progressCallback).toHaveBeenCalledTimes(expectedCalls);

      // Verify progress states
      const calls = progressCallback.mock.calls;

      // First call should be initial state
      expect(calls[0][0]).toMatchObject({
        currentBatch: 0,
        totalBatches: 3,
        currentTree: 0,
        totalTrees: 150,
        batchStatus: 'waiting'
      });

      // Last call should be final completion
      expect(calls[calls.length - 1][0]).toMatchObject({
        currentBatch: 3,
        totalBatches: 3,
        currentTree: 150,
        totalTrees: 150,
        batchStatus: 'completed'
      });
    });

    it('should generate ZIP blob with correct structure', async () => {
      const result = await batchGenerator.generateZipWithProgress(
        mockTrees,
        50,
        vi.fn(),
        mockOrchardName,
        mockLogoBase64
      );

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/zip');
    });

    it('should handle empty tree array', async () => {
      await expect(
        batchGenerator.generateZipWithProgress(
          [],
          50,
          vi.fn(),
          mockOrchardName,
          mockLogoBase64
        )
      ).rejects.toThrow('No trees to generate PDF for');
    });
  });

  describe('generateBatchPDF', () => {
    it('should generate PDF for a single batch', async () => {
      const batch = mockTrees.slice(0, 50);
      const result = await batchGenerator['generateBatch'](batch, 1, mockOrchardName, mockLogoBase64);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
    });
  });

  describe('cleanupBatch', () => {
    it('should revoke QR data URLs', () => {
      const mockRevokeObjectURL = vi.spyOn(URL, 'revokeObjectURL');

      const batchWithQR = mockTrees.slice(0, 5).map(tree => ({
        ...tree,
        qrDataUrl: 'data:image/png;base64,test'
      }));

      batchGenerator['cleanupBatch'](batchWithQR);

      expect(mockRevokeObjectURL).toHaveBeenCalledTimes(5);
      mockRevokeObjectURL.mockRestore();
    });
  });

  describe('memory tracking', () => {
    it('should track memory usage when available', () => {
      const mockPerformance = {
        memory: {
          usedJSHeapSize: 50000000,
          totalJSHeapSize: 100000000
        }
      };

      Object.defineProperty(global, 'performance', {
        value: mockPerformance,
        writable: true
      });

      const memoryInfo = batchGenerator['getMemoryInfo']();

      expect(memoryInfo).toBeDefined();
      expect(memoryInfo!.used).toBe(50000000);
      expect(memoryInfo!.total).toBe(100000000);
    });

    it('should handle when memory API is not available', () => {
      Object.defineProperty(global, 'performance', {
        value: {},
        writable: true
      });

      const memoryInfo = batchGenerator['getMemoryInfo']();

      expect(memoryInfo).toBeNull();
    });
  });
});