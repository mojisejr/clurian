import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PDFGeneratorModal } from '../../components/modals/pdf-generator-modal';
import { generatePDFBlob } from '../../lib/utils/pdf-generator';
import { BatchPDFGenerator } from '../../lib/utils/batch-pdf-generator';
import type { Tree } from '../../lib/types';

// Mock the PDF generation functions
vi.mock('../../lib/utils/pdf-generator', () => ({
  generatePDFBlob: vi.fn()
}));

const mockBatchPDFGenerator = {
  shouldUseBatchProcessing: vi.fn(),
  getProcessingInfo: vi.fn(() => ({
    useBatch: true,
    batchSize: 50,
    estimatedBatches: 2,
    estimatedFiles: 2
  })),
  generateZipWithProgress: vi.fn()
};

vi.mock('../../lib/utils/batch-pdf-generator', () => ({
  BatchPDFGenerator: class {
    constructor() {
      return mockBatchPDFGenerator;
    }
  }
}));

vi.mock('../../components/modals/batch-pdf-export-modal', () => ({
  BatchPDFExportModal: vi.fn(({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div data-testid="batch-modal">
        <button onClick={onClose}>Close Batch Modal</button>
        <button onClick={() => {
          // Simulate successful generation
          onClose();
        }}>Generate and Download</button>
      </div>
    );
  })
}));

describe('PDFGeneratorModal Integration', () => {
  let mockTrees: Tree[];
  let mockOrchardName: string;
  let mockLogoBase64: string;
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockTrees = Array.from({ length: 60 }, (_, i) => ({
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

  describe('single PDF mode (< 50 trees)', () => {
    beforeEach(() => {
      mockBatchPDFGenerator.shouldUseBatchProcessing.mockReturnValue(false);
      (generatePDFBlob as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Blob(['pdf content'], { type: 'application/pdf' })
      );
    });

    it('should use single PDF generation for small orchards', async () => {
      render(
        <PDFGeneratorModal
          isOpen={true}
          onClose={mockOnClose}
          trees={mockTrees.slice(0, 25)}
          orchardName={mockOrchardName}
          logoBase64={mockLogoBase64}
        />
      );

      expect(screen.getByText('สร้าง PDF QR Code')).toBeInTheDocument();
      expect(screen.getByText(/กำลังสร้าง QR Code สำหรับ 25 ต้น/)).toBeInTheDocument();

      await waitFor(() => {
        expect(generatePDFBlob).toHaveBeenCalledTimes(1);
      });
    });

    it('should show single PDF download when complete', async () => {
      (generatePDFBlob as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Blob(['pdf content'], { type: 'application/pdf' })
      );

      Object.assign(global, {
        URL: {
          createObjectURL: vi.fn(() => 'mock-url'),
          revokeObjectURL: vi.fn()
        },
        Blob: vi.fn().mockImplementation((content, options) => ({ content, type: options.type }))
      });

      const linkMock = {
        href: '',
        download: '',
        click: vi.fn()
      };

      vi.spyOn(document, 'createElement').mockReturnValue(linkMock as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => linkMock as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => linkMock as any);

      render(
        <PDFGeneratorModal
          isOpen={true}
          onClose={mockOnClose}
          trees={mockTrees.slice(0, 25)}
          orchardName={mockOrchardName}
          logoBase64={mockLogoBase64}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/PDF พร้อมแล้ว!/)).toBeInTheDocument();
      });

      const downloadButton = screen.getByRole('button', { name: /ดาวน์โหลด/i });
      fireEvent.click(downloadButton);

      expect(linkMock.download).toContain('.pdf');
    });
  });

  describe('batch mode (> 50 trees)', () => {
    it('should show batch export modal for large orchards', async () => {
      mockBatchPDFGenerator.shouldUseBatchProcessing.mockReturnValue(true);
      mockBatchPDFGenerator.getProcessingInfo.mockReturnValue({
        useBatch: true,
        batchSize: 50,
        estimatedBatches: 2,
        estimatedFiles: 2
      });

      render(
        <PDFGeneratorModal
          isOpen={true}
          onClose={mockOnClose}
          trees={mockTrees}
          orchardName={mockOrchardName}
          logoBase64={mockLogoBase64}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/จะแบ่งเป็น 2 ไฟล์/i)).toBeInTheDocument();
        expect(screen.getByText(/รวมเป็น ZIP:/i)).toBeInTheDocument();
      });
    });

    it('should call BatchPDFGenerator when export is triggered', async () => {
      const mockBlob = new Blob(['zip content'], { type: 'application/zip' });
      mockBatchPDFGenerator.shouldUseBatchProcessing.mockReturnValue(true);
      mockBatchPDFGenerator.getProcessingInfo.mockReturnValue({
        useBatch: true,
        batchSize: 50,
        estimatedBatches: 2,
        estimatedFiles: 2
      });
      mockBatchPDFGenerator.generateZipWithProgress.mockResolvedValue(mockBlob);

      render(
        <PDFGeneratorModal
          isOpen={true}
          onClose={mockOnClose}
          trees={mockTrees}
          orchardName={mockOrchardName}
          logoBase64={mockLogoBase64}
        />
      );

      // Wait for batch modal to render
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /สร้างและดาวน์โหลด/i })).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', { name: /สร้างและดาวน์โหลด/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockGenerator.generateZipWithProgress).toHaveBeenCalledTimes(1);
        expect(mockGenerator.generateZipWithProgress).toHaveBeenCalledWith(
          mockTrees,
          50,
          expect.any(Function),
          mockOrchardName,
          mockLogoBase64
        );
      });
    });
  });

  describe('error handling', () => {
    it('should handle PDF generation errors', async () => {
      mockBatchPDFGenerator.shouldUseBatchProcessing.mockReturnValue(false);
      (generatePDFBlob as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('PDF generation failed')
      );

      render(
        <PDFGeneratorModal
          isOpen={true}
          onClose={mockOnClose}
          trees={mockTrees.slice(0, 25)}
          orchardName={mockOrchardName}
          logoBase64={mockLogoBase64}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('เกิดข้อผิดพลาด')).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: 'ลองใหม่' });
      fireEvent.click(retryButton);

      expect(generatePDFBlob).toHaveBeenCalledTimes(2);
    });
  });

  describe('modal behavior', () => {
    it('should close modal when close button is clicked', () => {
      mockBatchPDFGenerator.shouldUseBatchProcessing.mockReturnValue(false);

      render(
        <PDFGeneratorModal
          isOpen={true}
          onClose={mockOnClose}
          trees={mockTrees.slice(0, 25)}
          orchardName={mockOrchardName}
          logoBase64={mockLogoBase64}
        />
      );

      const closeButton = screen.getByRole('button', { name: 'ปิด' });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not generate PDF when modal is closed', () => {
      mockBatchPDFGenerator.shouldUseBatchProcessing.mockReturnValue(false);

      render(
        <PDFGeneratorModal
          isOpen={false}
          onClose={mockOnClose}
          trees={mockTrees.slice(0, 25)}
          orchardName={mockOrchardName}
          logoBase64={mockLogoBase64}
        />
      );

      expect(generatePDFBlob).not.toHaveBeenCalled();
    });
  });
});