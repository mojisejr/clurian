/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, AlertCircle } from "lucide-react";
import { generatePDFBlob } from "@/lib/utils/pdf-generator";
import { BatchPDFGenerator } from "@/lib/utils/batch-pdf-generator";
import { BatchPDFExportModal } from "./batch-pdf-export-modal";
import type { Tree } from "@/lib/types";

interface PDFGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  trees: Tree[];
  orchardName: string;
  logoBase64: string;
}

type ModalState = 'idle' | 'generating' | 'ready' | 'error';

export function PDFGeneratorModal({ isOpen, onClose, trees, orchardName, logoBase64 }: PDFGeneratorModalProps) {
  const [state, setState] = useState<ModalState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  // For batch processing
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchGenerator] = useState(() => new BatchPDFGenerator());

  const generatePDF = useCallback(async () => {
    setState('generating');
    setProgress(0);
    setError('');

    try {
      const blob = await generatePDFBlob(
        trees,
        orchardName,
        logoBase64,
        (current, total) => {
          setProgress((current / total) * 100);
        }
      );
      setPdfBlob(blob);
      setState('ready');
    } catch {
      setError('Failed to generate PDF');
      setState('error');
    }
  }, [trees, orchardName, logoBase64]);

  useEffect(() => {
    if (isOpen && trees.length > 0) {
      // Check if we need batch processing
      const shouldUseBatch = batchGenerator.shouldUseBatchProcessing(trees.length);
      if (shouldUseBatch) {
        setShowBatchModal(true);
      } else {
        generatePDF();
      }
    }

    return () => {
      setState('idle');
      setProgress(0);
      setError('');
      setPdfBlob(null);
      setShowBatchModal(false);
    };
  }, [isOpen, trees.length, generatePDF, batchGenerator]);

  const handleDownload = () => {
    if (!pdfBlob) return;

    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `QR_Codes_${orchardName}_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Close modal after download
    setTimeout(() => onClose(), 500);
  };

  const handleRetry = () => {
    generatePDF();
  };

  const handleClose = () => {
    if (pdfBlob) {
      URL.revokeObjectURL(URL.createObjectURL(pdfBlob));
    }
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen && !showBatchModal} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>สร้าง PDF QR Code</DialogTitle>
          </DialogHeader>

          <div className="py-6">
            {state === 'generating' && (
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    กำลังสร้าง QR Code สำหรับ {trees.length} ต้น...
                  </p>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{progress}%</p>
                </div>
              </div>
            )}

            {state === 'ready' && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Download className="h-6 w-6 text-green-600" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">PDF พร้อมแล้ว!</p>
                  <p className="text-sm text-muted-foreground">
                    สร้าง QR Code สำหรับ {trees.length} ต้นเรียบร้อย
                  </p>
                </div>
              </div>
            )}

            {state === 'error' && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-destructive">เกิดข้อผิดพลาด</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {state === 'generating' && (
              <Button variant="outline" onClick={handleClose}>
                ยกเลิก
              </Button>
            )}

            {state === 'ready' && (
              <>
                <Button variant="outline" onClick={handleClose}>
                  ปิด
                </Button>
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  ดาวน์โหลด
                </Button>
              </>
            )}

            {state === 'error' && (
              <>
                <Button variant="outline" onClick={handleClose}>
                  ปิด
                </Button>
                <Button onClick={handleRetry}>
                  ลองใหม่
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Export Modal */}
      <BatchPDFExportModal
        isOpen={showBatchModal}
        onClose={() => {
          setShowBatchModal(false);
          onClose();
        }}
        trees={trees}
        orchardName={orchardName}
        logoBase64={logoBase64}
      />
    </>
  );
}
