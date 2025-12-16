import { pdf } from '@react-pdf/renderer';
import { OrchardQRDocument } from '@/components/pdf/orchard-qr-document';
import QRCode from 'qrcode';
import JSZip from 'jszip';
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
  private readonly DEFAULT_BATCH_SIZE = 50;
  private readonly MAX_BATCH_SIZE = 100;

  /**
   * Calculate optimal batch size based on tree count and memory constraints
   */
  private calculateOptimalBatchSize(treeCount: number): number {
    if (treeCount <= 50) return treeCount;
    if (treeCount <= 100) return 50;
    return this.MAX_BATCH_SIZE; // Return 100 for large orchards
  }

  /**
   * Split trees into batches for processing
   */
  private createBatches(trees: Tree[], batchSize: number): Tree[][] {
    const batches: Tree[][] = [];
    for (let i = 0; i < trees.length; i += batchSize) {
      batches.push(trees.slice(i, i + batchSize));
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
   * Generate QR codes for a batch of trees
   */
  private async generateQRCodes(trees: Tree[]): Promise<QRItem[]> {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://clurian.vercel.app';
    const qrData: QRItem[] = [];

    for (const tree of trees) {
      const treeDetailPath = `/dashboard?treeId=${tree.id}`;
      const loginUrl = `${baseUrl}/login?redirect=${encodeURIComponent(treeDetailPath)}`;

      try {
        const qrDataUrl = await QRCode.toDataURL(loginUrl, {
          width: 256,
          margin: 1,
          errorCorrectionLevel: 'M'
        });

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
    const qrData = await this.generateQRCodes(batch);

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
}