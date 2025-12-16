import { pdf } from '@react-pdf/renderer';
import { OrchardQRDocument } from '@/components/pdf/orchard-qr-document';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { getSortedTreesForPDF } from './tree-sorting';
import type { Tree } from '@/lib/types';

export interface QRItem extends Tree {
  url: string;
  qrDataUrl?: string;
}

export interface BatchProgress {
  currentBatch: number;
  totalBatches: number;
  currentTree: number;
  totalTrees: number;
  batchStatus: 'waiting' | 'generating' | 'completed';
  memoryUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
}

export type BatchProgressCallback = (progress: BatchProgress) => void;

export class BatchPDFGenerator {
  private readonly TREES_PER_PAGE = 8; // Optimized for A4 page layout
  public readonly DEFAULT_BATCH_SIZE = 50;
  public readonly MAX_BATCH_SIZE = 100;
  private readonly MEMORY_WARNING_THRESHOLD = 80; // 80%
  private readonly MEMORY_CRITICAL_THRESHOLD = 90; // 90%
  private readonly QR_CODE_CACHE = new Map<string, string>();

  /**
   * Calculate optimal batch size based on tree count and memory constraints
   */
  private calculateOptimalBatchSize(treeCount: number): number {
    if (treeCount <= 50) return treeCount;
    if (treeCount <= 100) return 50;

    // Check memory constraints
    const memoryInfo = this.getMemoryInfo();
    if (memoryInfo) {
      const memoryPercentage = (memoryInfo.used / memoryInfo.total) * 100;

      // Reduce batch size if memory usage is high
      if (memoryPercentage > this.MEMORY_CRITICAL_THRESHOLD) {
        return 25; // Smaller batches for high memory usage
      } else if (memoryPercentage > this.MEMORY_WARNING_THRESHOLD) {
        return 40; // Moderate batch size for warning level
      }
    }

    return this.MAX_BATCH_SIZE; // Return 100 for large orchards
  }

  /**
   * Split trees into batches for processing
   */
  private createBatches(trees: Tree[], batchSize: number): Tree[][] {
    const batches: Tree[][] = [];
    const effectiveBatchSize = Math.min(batchSize, this.MAX_BATCH_SIZE);
    for (let i = 0; i < trees.length; i += effectiveBatchSize) {
      batches.push(trees.slice(i, i + effectiveBatchSize));
    }
    return batches;
  }

  /**
   * Get memory usage information if available
   */
  private getMemoryInfo(): { used: number; total: number } | null {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as Performance & { memory: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize
      };
    }
    return null;
  }

  /**
   * Force garbage collection if available
   */
  private forceGarbageCollection(): void {
    if (typeof window !== 'undefined') {
      const windowWithGC = window as Window & { gc?: () => void };
      if (windowWithGC.gc) {
        windowWithGC.gc();
      }
    }
  }

  /**
   * Check memory pressure and return status
   */
  private checkMemoryPressure(): {
    status: 'normal' | 'warning' | 'critical';
    percentage: number;
    shouldReduceBatchSize: boolean;
  } {
    const memoryInfo = this.getMemoryInfo();
    if (!memoryInfo) {
      return { status: 'normal', percentage: 0, shouldReduceBatchSize: false };
    }

    const percentage = (memoryInfo.used / memoryInfo.total) * 100;

    if (percentage > this.MEMORY_CRITICAL_THRESHOLD) {
      return { status: 'critical', percentage, shouldReduceBatchSize: true };
    } else if (percentage > this.MEMORY_WARNING_THRESHOLD) {
      return { status: 'warning', percentage, shouldReduceBatchSize: false };
    }

    return { status: 'normal', percentage, shouldReduceBatchSize: false };
  }

  /**
   * Clean up QR data URLs to free memory
   */
  private cleanupBatch(batchData: QRItem[]): void {
    batchData.forEach(item => {
      if (item.qrDataUrl) {
        URL.revokeObjectURL(item.qrDataUrl);
      }
    });
    this.forceGarbageCollection();
  }

  /**
   * Clean up QR code cache
   */
  private cleanupCache(): void {
    this.QR_CODE_CACHE.clear();
    this.forceGarbageCollection();
  }

  /**
   * Generate QR codes for a batch of trees with caching
   */
  private async generateQRCodes(trees: Tree[]): Promise<QRItem[]> {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://clurian.vercel.app';
    const qrData: QRItem[] = [];

    for (const tree of trees) {
      const treeDetailPath = `/dashboard?treeId=${tree.id}`;
      const loginUrl = `${baseUrl}/login?redirect=${encodeURIComponent(treeDetailPath)}`;

      try {
        // Check cache first
        if (this.QR_CODE_CACHE.has(loginUrl)) {
          qrData.push({
            ...tree,
            url: loginUrl,
            qrDataUrl: this.QR_CODE_CACHE.get(loginUrl)
          });
          continue;
        }

        const qrDataUrl = await QRCode.toDataURL(loginUrl, {
          width: 256,
          margin: 1,
          errorCorrectionLevel: 'M'
        });

        // Cache the QR code (limit cache size)
        if (this.QR_CODE_CACHE.size < 1000) {
          this.QR_CODE_CACHE.set(loginUrl, qrDataUrl);
        }

        qrData.push({
          ...tree,
          url: loginUrl,
          qrDataUrl
        });
      } catch (error) {
        console.error(`Failed to generate QR for tree ${tree.code}:`, error);
        qrData.push({
          ...tree,
          url: loginUrl
        });
      }
    }

    return qrData;
  }

  /**
   * Generate PDF for a single batch
   */
  private async generateBatch(
    batch: Tree[],
    batchIndex: number,
    orchardName: string,
    logoBase64: string
  ): Promise<Blob> {
    // Apply proper sorting and assign running numbers
    const sortedTrees = getSortedTreesForPDF(batch);
    const qrData = await this.generateQRCodes(sortedTrees);

    try {
      const doc = OrchardQRDocument({
        trees: qrData,
        orchardName,
        logoUrl: logoBase64
      });

      const blob = await pdf(doc).toBlob();
      return blob;
    } finally {
      this.cleanupBatch(qrData);
    }
  }

  /**
   * Generate ZIP file containing multiple PDFs with progress tracking
   */
  async generateZipWithProgress(
    trees: Tree[],
    batchSize: number | undefined,
    onProgress: BatchProgressCallback,
    orchardName: string,
    logoBase64: string
  ): Promise<Blob> {
    if (trees.length === 0) {
      throw new Error('No trees to generate PDF for');
    }

    const optimalBatchSize = batchSize || this.calculateOptimalBatchSize(trees.length);
    const batches = this.createBatches(trees, optimalBatchSize);
    const zip = new JSZip();

    let processedTrees = 0;

    // Report initial progress
    onProgress({
      currentBatch: 0,
      totalBatches: batches.length,
      currentTree: 0,
      totalTrees: trees.length,
      batchStatus: 'waiting',
      memoryUsage: this.getMemoryInfo() ? {
        ...this.getMemoryInfo()!,
        percentage: (this.getMemoryInfo()!.used / this.getMemoryInfo()!.total) * 100
      } : undefined
    });

    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      // Check memory pressure before processing
      const memoryPressure = this.checkMemoryPressure();
      if (memoryPressure.status === 'critical') {
        // Force cleanup before critical batch
        this.cleanupCache();
      }

      // Update progress for batch start
      onProgress({
        currentBatch: i + 1,
        totalBatches: batches.length,
        currentTree: processedTrees,
        totalTrees: trees.length,
        batchStatus: 'generating',
        memoryUsage: this.getMemoryInfo() ? {
          ...this.getMemoryInfo()!,
          percentage: (this.getMemoryInfo()!.used / this.getMemoryInfo()!.total) * 100
        } : undefined
      });

      try {
        // Generate PDF for this batch
        const pdfBlob = await this.generateBatch(batch, i + 1, orchardName, logoBase64);

        // Add to ZIP with proper naming
        const batchNumber = String(i + 1).padStart(2, '0');
        const filename = `${orchardName.replace(/[^a-zA-Z0-9]/g, '_')}_Batch_${batchNumber}.pdf`;
        zip.file(filename, pdfBlob);

        processedTrees += batch.length;

        // Update progress for batch completion
        onProgress({
          currentBatch: i + 1,
          totalBatches: batches.length,
          currentTree: processedTrees,
          totalTrees: trees.length,
          batchStatus: 'completed',
          memoryUsage: this.getMemoryInfo() ? {
            ...this.getMemoryInfo()!,
            percentage: (this.getMemoryInfo()!.used / this.getMemoryInfo()!.total) * 100
          } : undefined
        });

        // Check memory pressure after each batch
        const postBatchMemoryPressure = this.checkMemoryPressure();
        if (postBatchMemoryPressure.status === 'critical' && i < batches.length - 1) {
          // If memory is critical and we have more batches, pause for cleanup
          await new Promise(resolve => setTimeout(resolve, 100));
          this.forceGarbageCollection();
        }

      } catch (error) {
        console.error(`Failed to generate batch ${i + 1}:`, error);
        throw new Error(`Failed to generate batch ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Generate final ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return zipBlob;
  }

  /**
   * Check if batch processing is recommended
   */
  shouldUseBatchProcessing(treeCount: number): boolean {
    return treeCount > 50;
  }

  /**
   * Get estimated processing info
   */
  getProcessingInfo(treeCount: number): {
    useBatch: boolean;
    batchSize: number;
    estimatedBatches: number;
    estimatedFiles: number;
  } {
    const useBatch = this.shouldUseBatchProcessing(treeCount);
    const batchSize = useBatch ? this.calculateOptimalBatchSize(treeCount) : treeCount;
    const estimatedBatches = Math.ceil(treeCount / batchSize);
    const estimatedFiles = useBatch ? estimatedBatches : 1;

    return {
      useBatch,
      batchSize,
      estimatedBatches,
      estimatedFiles
    };
  }

  /**
   * Clean up resources when done
   */
  cleanup(): void {
    this.cleanupCache();
    this.forceGarbageCollection();
  }

  /**
   * Get memory pressure status
   */
  getMemoryStatus(): {
    status: 'normal' | 'warning' | 'critical';
    percentage: number;
    shouldReduceBatchSize: boolean;
  } {
    return this.checkMemoryPressure();
  }
}