/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BatchPDFExportModal } from '../../components/modals/batch-pdf-export-modal';
import { BatchPDFGenerator } from '../../lib/utils/batch-pdf-generator';
import type { Tree } from '../../lib/types';

// Mock the BatchPDFGenerator
const mockBatchGeneratorClass = {
  shouldUseBatchProcessing: vi.fn(),
  getProcessingInfo: vi.fn(),
  generateZipWithProgress: vi.fn()
};

vi.mock('../../lib/utils/batch-pdf-generator', () => ({
  BatchPDFGenerator: vi.fn(() => mockBatchGeneratorClass)
}));

// Mock download functionality
Object.assign(global, {
  URL: {
    createObjectURL: vi.fn(() => 'mock-url'),
    revokeObjectURL: vi.fn()
  },
  Blob: vi.fn().mockImplementation((content, options) => ({ content, type: options.type }))
});

describe('BatchPDFExportModal', () => {
  let mockTrees: Tree[];
  let mockOrchardName: string;
  let mockLogoBase64: string;
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

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
    mockOnClose = vi.fn();
  });

  describe('when tree count < 50 (single PDF mode)', () => {
    beforeEach(() => {
      mockBatchGeneratorClass.shouldUseBatchProcessing.mockReturnValue(false);
    });

    it('should show single PDF mode message', () => {
      render(
        <BatchPDFExportModal
          isOpen={true}
          onClose={mockOnClose}
          trees={mockTrees.slice(0, 25)}
          orchardName={mockOrchardName}
          logoBase64={mockLogoBase64}
        />
      );

      expect(screen.getByText(/จำนวนต้นไม้: 25 ต้น/i)).toBeInTheDocument();
      expect(screen.getByText(/จะสร้างเป็น PDF ไฟล์เดียว/i)).toBeInTheDocument();
    });

    it('should not show batch options', () => {
      render(
        <BatchPDFExportModal
          isOpen={true}
          onClose={mockOnClose}
          trees={mockTrees.slice(0, 25)}
          orchardName={mockOrchardName}
          logoBase64={mockLogoBase64}
        />
      );

      expect(screen.queryByText('Batch Size')).not.toBeInTheDocument();
      expect(screen.queryByText('Auto ZIP')).not.toBeInTheDocument();
    });
  });

  describe('when tree count >= 50 (batch mode)', () => {
    beforeEach(() => {
      mockBatchGeneratorClass.shouldUseBatchProcessing.mockReturnValue(true);
      mockBatchGeneratorClass.getProcessingInfo.mockReturnValue({
        useBatch: true,
        batchSize: 50,
        estimatedBatches: 3,
        estimatedFiles: 3
      });
    });

    it('should show batch mode information', () => {
      render(
        <BatchPDFExportModal
          isOpen={true}
          onClose={mockOnClose}
          trees={mockTrees}
          orchardName={mockOrchardName}
          logoBase64={mockLogoBase64}
        />
      );

      expect(screen.getByText(/จำนวนต้นไม้: 150 ต้น/i)).toBeInTheDocument();
      expect(screen.getByText(/⚠️ จะแบ่งเป็น 3 ไฟล์/i)).toBeInTheDocument();
      expect(screen.getByText(/✅ รวมเป็น ZIP:/i)).toBeInTheDocument();
    });

    it('should show batch size selector', () => {
      render(
        <BatchPDFExportModal
          isOpen={true}
          onClose={mockOnClose}
          trees={mockTrees}
          orchardName={mockOrchardName}
          logoBase64={mockLogoBase64}
        />
      );

      expect(screen.getByText('Batch Size')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should update batch info when changing batch size', async () => {
      render(
        <BatchPDFExportModal
          isOpen={true}
          onClose={mockOnClose}
          trees={mockTrees}
          orchardName={mockOrchardName}
          logoBase64={mockLogoBase64}
        />
      );

      const batchSizeSelect = screen.getByRole('combobox');

      // Open dropdown
      fireEvent.click(batchSizeSelect);

      // Select different batch size
      const option50 = screen.getByText('50 ต้น/ไฟล์');
      fireEvent.click(option50);

      await waitFor(() => {
        expect(screen.getByText(/จะแบ่งเป็น 3 ไฟล์/i)).toBeInTheDocument();
      });
    });

    it('should have auto ZIP option selected by default', () => {
      render(
        <BatchPDFExportModal
          isOpen={true}
          onClose={mockOnClose}
          trees={mockTrees}
          orchardName={mockOrchardName}
          logoBase64={mockLogoBase64}
        />
      );

      const autoZipCheckbox = screen.getByLabelText('Auto ZIP และ download ครั้งเดียว');
      expect(autoZipCheckbox).toBeChecked();
    });
  });

  describe('progress tracking', () => {
    it('should show progress bar during generation', async () => {
      const mockProgressCallback = vi.fn();
      const mockGenerator = new BatchPDFGenerator();
      (mockGenerator.generateZipWithProgress as ReturnType<typeof vi.fn>).mockImplementation(
        (trees, batchSize, onProgress) => {
          // Simulate progress updates
          onProgress({
            currentBatch: 1,
            totalBatches: 2,
            currentTree: 0,
            totalTrees: 150,
            batchStatus: 'waiting'
          });

          setTimeout(() => {
            onProgress({
              currentBatch: 1,
              totalBatches: 2,
              currentTree: 50,
              totalTrees: 150,
              batchStatus: 'completed'
            });
          }, 100);

          return Promise.resolve(new Blob(['zip content'], { type: 'application/zip' }));
        }
      );

      render(
        <BatchPDFExportModal
          isOpen={true}
          onClose={mockOnClose}
          trees={mockTrees}
          orchardName={mockOrchardName}
          logoBase64={mockLogoBase64}
        />
      );

      const exportButton = screen.getByRole('button', { name: /สร้างและดาวน์โหลด/i });
      fireEvent.click(exportButton);

      // Should show progress
      await waitFor(() => {
        expect(screen.getByText(/กำลังสร้างไฟล์ที่ 1\/2/i)).toBeInTheDocument();
      });
    });

    it('should show memory usage when available', async () => {
      const mockGenerator = new BatchPDFGenerator();
      (mockGenerator.generateZipWithProgress as ReturnType<typeof vi.fn>).mockImplementation(
        (trees, batchSize, onProgress) => {
          onProgress({
            currentBatch: 1,
            totalBatches: 2,
            currentTree: 25,
            totalTrees: 150,
            batchStatus: 'generating',
            memoryUsage: {
              used: 50000000,
              total: 100000000,
              percentage: 50
            }
          });

          return Promise.resolve(new Blob(['zip content'], { type: 'application/zip' }));
        }
      );

      render(
        <BatchPDFExportModal
          isOpen={true}
          onClose={mockOnClose}
          trees={mockTrees}
          orchardName={mockOrchardName}
          logoBase64={mockLogoBase64}
        />
      );

      const exportButton = screen.getByRole('button', { name: /สร้างและดาวน์โหลด/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/Memory: 47.7 MB \/ 95.4 MB/)).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('should show error message when generation fails', async () => {
      const mockGenerator = new BatchPDFGenerator();
      (mockGenerator.generateZipWithProgress as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Failed to generate PDF')
      );

      render(
        <BatchPDFExportModal
          isOpen={true}
          onClose={mockOnClose}
          trees={mockTrees}
          orchardName={mockOrchardName}
          logoBase64={mockLogoBase64}
        />
      );

      const exportButton = screen.getByRole('button', { name: /สร้างและดาวน์โหลด/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/เกิดข้อผิดพลาดในการสร้าง PDF/i)).toBeInTheDocument();
        expect(screen.getByText('Failed to generate PDF')).toBeInTheDocument();
      });
    });

    it('should show retry button when generation fails', async () => {
      const mockGenerator = new BatchPDFGenerator();
      (mockGenerator.generateZipWithProgress as ReturnType<typeof vi.fn>)
        .mockRejectedValueOnce(new Error('Failed to generate PDF'))
        .mockResolvedValueOnce(new Blob(['zip content'], { type: 'application/zip' }));

      render(
        <BatchPDFExportModal
          isOpen={true}
          onClose={mockOnClose}
          trees={mockTrees}
          orchardName={mockOrchardName}
          logoBase64={mockLogoBase64}
        />
      );

      const exportButton = screen.getByRole('button', { name: /สร้างและดาวน์โหลด/i });
      fireEvent.click(exportButton);

      // Wait for error
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'ลองใหม่' })).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByRole('button', { name: 'ลองใหม่' });
      fireEvent.click(retryButton);

      // Should start generation again
      await waitFor(() => {
        expect(mockGenerator.generateZipWithProgress).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('download functionality', () => {
    it('should download ZIP file when generation completes', async () => {
      const mockBlob = new Blob(['zip content'], { type: 'application/zip' });
      const mockGenerator = new BatchPDFGenerator();
      (mockGenerator.generateZipWithProgress as ReturnType<typeof vi.fn>).mockResolvedValue(mockBlob);

      const linkMock = {
        href: '',
        download: '',
        click: vi.fn()
      };

      vi.spyOn(document, 'createElement').mockReturnValue(linkMock as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => linkMock as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => linkMock as any);

      render(
        <BatchPDFExportModal
          isOpen={true}
          onClose={mockOnClose}
          trees={mockTrees}
          orchardName={mockOrchardName}
          logoBase64={mockLogoBase64}
        />
      );

      const exportButton = screen.getByRole('button', { name: /สร้างและดาวน์โหลด/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(linkMock.download).toBe('QR_Codes_Test_Orchard.zip');
        expect(linkMock.click).toHaveBeenCalled();
      });
    });

    it('should close modal after successful download', async () => {
      const mockBlob = new Blob(['zip content'], { type: 'application/zip' });
      const mockGenerator = new BatchPDFGenerator();
      (mockGenerator.generateZipWithProgress as ReturnType<typeof vi.fn>).mockResolvedValue(mockBlob);

      vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        download: '',
        click: vi.fn()
      } as any);

      vi.spyOn(document.body, 'appendChild').mockImplementation(() => ({} as any));
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => ({} as any));

      render(
        <BatchPDFExportModal
          isOpen={true}
          onClose={mockOnClose}
          trees={mockTrees}
          orchardName={mockOrchardName}
          logoBase64={mockLogoBase64}
        />
      );

      const exportButton = screen.getByRole('button', { name: /สร้างและดาวน์โหลด/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }, { timeout: 3000 });
    });
  });
});