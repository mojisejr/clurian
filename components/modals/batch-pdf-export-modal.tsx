/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Download, AlertCircle, Package, Zap, HardDrive, Clock, CheckCircle, XCircle } from "lucide-react";
import { BatchPDFGenerator, type BatchProgress } from "@/lib/utils/batch-pdf-generator";
import type { Tree } from "@/lib/types";

interface BatchPDFExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  trees: Tree[];
  orchardName: string;
  logoBase64: string;
}

type ModalState = 'idle' | 'configuring' | 'generating' | 'ready' | 'error' | 'cancelled';
type ExportMode = 'zip' | 'individual';

export function BatchPDFExportModal({
  isOpen,
  onClose,
  trees,
  orchardName,
  logoBase64
}: BatchPDFExportModalProps) {
  const [state, setState] = useState<ModalState>('idle');
  const [progress, setProgress] = useState<BatchProgress | null>(null);
  const [error, setError] = useState<string>('');
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Configuration options
  const [batchSize, setBatchSize] = useState<number>(50);
  const [exportMode, setExportMode] = useState<ExportMode>('zip');

  const [batchGenerator] = useState(() => new BatchPDFGenerator());
  const [processingInfo, setProcessingInfo] = useState(() =>
    batchGenerator.getProcessingInfo(trees.length)
  );

  // Format bytes to human readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format memory usage
  const formatMemoryUsage = (memory?: { used: number; total: number }): string => {
    if (!memory) return '';
    return `Memory: ${formatBytes(memory.used)} / ${formatBytes(memory.total)}`;
  };

  // Initialize modal state
  useEffect(() => {
    if (isOpen && trees.length > 0) {
      const useBatch = batchGenerator.shouldUseBatchProcessing(trees.length);
      const info = batchGenerator.getProcessingInfo(trees.length);

      setState(useBatch ? 'configuring' : 'idle');
      setProcessingInfo(info);
      setError('');
      setZipBlob(null);
      setProgress(null);
    }
  }, [isOpen, trees.length, batchGenerator]);

  const handleGenerate = useCallback(async () => {
    const controller = new AbortController();
    setAbortController(controller);

    setState('generating');
    setError('');
    setProgress(null);

    try {
      const blob = await batchGenerator.generateZipWithProgress(
        trees,
        batchSize,
        (progressData) => {
          // Check if operation was cancelled
          if (controller.signal.aborted) {
            throw new Error('Operation cancelled by user');
          }
          setProgress(progressData);
        },
        orchardName,
        logoBase64
      );

      // Check if cancelled after completion
      if (controller.signal.aborted) {
        setState('cancelled');
        return;
      }

      setZipBlob(blob);
      setState('ready');
    } catch (err) {
      if (controller.signal.aborted || err instanceof Error && err.message === 'Operation cancelled by user') {
        setState('cancelled');
        setError('การสร้าง PDF ถูกยกเลิก');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate PDF';
        setError(errorMessage);
        setState('error');
      }
    } finally {
      setAbortController(null);
    }
  }, [trees, batchSize, orchardName, logoBase64, batchGenerator]);

  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
    }
    batchGenerator.cleanup();
    setState('cancelled');
    setError('การสร้าง PDF ถูกยกเลิก');
  };

  const handleDownload = useCallback(() => {
    if (!zipBlob) return;

    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `QR_Codes_${orchardName.replace(/[^a-zA-Z0-9]/g, '_')}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Close modal after successful download
    setTimeout(() => onClose(), 500);
  }, [zipBlob, orchardName, onClose]);

  const handleRetry = () => {
    handleGenerate();
  };

  const handleClose = () => {
    if (abortController) {
      abortController.abort();
    }
    if (zipBlob) {
      URL.revokeObjectURL(URL.createObjectURL(zipBlob));
    }
    batchGenerator.cleanup();
    onClose();
  };

  // Calculate estimated processing time
  const getEstimatedTime = (): string => {
    const timePerTree = 0.1; // 100ms per tree estimate
    const totalSeconds = Math.ceil(trees.length * timePerTree / batchSize) * batchSize;

    if (totalSeconds < 60) return `~${totalSeconds} วินาที`;
    const minutes = Math.ceil(totalSeconds / 60);
    return `~${minutes} นาที`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            สร้าง PDF QR Code - โหมด Batch Processing
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {state === 'configuring' && (
            <div className="space-y-6">
              {/* Information Panel */}
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">ข้อมูลการสร้าง PDF</span>
                </div>
                <div className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
                  <div>จำนวนต้นไม้: <strong>{trees.length}</strong> ต้น</div>
                  <div className="flex items-center gap-1">
                    ⚠️ จะแบ่งเป็น
                    <strong>{processingInfo.estimatedBatches}</strong> ไฟล์
                    ({processingInfo.batchSize} ต้น/ไฟล์)
                  </div>
                  <div className="flex items-center gap-1">
                    ✅ รวมเป็น ZIP:
                    <strong>QR_Codes_{orchardName}.zip</strong>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ประมาณการใช้เวลา: {getEstimatedTime()}
                  </div>
                </div>
              </div>

              {/* Configuration Options */}
              <div className="space-y-4">
                {/* Batch Size Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Batch Size</label>
                  <Select value={batchSize.toString()} onValueChange={(v) => setBatchSize(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50 ต้น/ไฟล์ (แนะนำ)</SelectItem>
                      <SelectItem value="100">100 ต้น/ไฟล์ (เร็วขึ้น)</SelectItem>
                      {trees.length > 100 && (
                        <SelectItem value={Math.ceil(trees.length / 3).toString()}>
                          {Math.ceil(trees.length / 3)} ต้น/ไฟล์ (3 ไฟล์)
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Export Mode */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="auto-zip"
                      checked={exportMode === 'zip'}
                      onCheckedChange={(checked) => setExportMode(checked ? 'zip' : 'individual')}
                    />
                    <label
                      htmlFor="auto-zip"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Auto ZIP และ download ครั้งเดียว (แนะนำ)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="individual"
                      checked={exportMode === 'individual'}
                      onCheckedChange={(checked) => setExportMode(checked ? 'individual' : 'zip')}
                    />
                    <label
                      htmlFor="individual"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Download ทีละไฟล์
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="limit"
                      checked={false}
                      disabled
                    />
                    <label
                      htmlFor="limit"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                    >
                      จำกัด 100 ต้นแรกเท่านั้น (ยังไม่รองรับ)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {state === 'generating' && progress && (
            <div className="space-y-4">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    กำลังสร้างไฟล์ที่ {progress.currentBatch}/{progress.totalBatches}...
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all duration-300"
                      style={{ width: `${(progress.currentBatch / progress.totalBatches) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((progress.currentBatch / progress.totalBatches) * 100)}%
                  </p>
                </div>
              </div>

              {/* Batch Status */}
              <div className="space-y-2">
                <div className="text-sm font-medium">สถานะการสร้างไฟล์:</div>
                <div className="grid grid-cols-1 gap-1">
                  {Array.from({ length: progress.totalBatches }, (_, i) => {
                    const batchNum = i + 1;
                    const isCompleted = batchNum < progress.currentBatch;
                    const isCurrent = batchNum === progress.currentBatch;
                    const isPending = batchNum > progress.currentBatch;

                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-2 rounded-md text-sm ${
                          isCompleted ? 'bg-green-50 text-green-700' :
                          isCurrent ? 'bg-blue-50 text-blue-700' :
                          'bg-muted text-muted-foreground'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {isCompleted && <CheckCircle className="h-4 w-4" />}
                          {isCurrent && <Loader2 className="h-4 w-4 animate-spin" />}
                          {isPending && <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />}
                          ไฟล์ที่ {batchNum}
                        </span>
                        <span>
                          {isCompleted && `✅ Complete`}
                          {isCurrent && `🔄 กำลังสร้าง...`}
                          {isPending && `⏳ รอ...`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Memory Usage */}
              {progress.memoryUsage && (
                <div className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-950 rounded-md text-sm">
                  <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                    <HardDrive className="h-4 w-4" />
                    {formatMemoryUsage(progress.memoryUsage)}
                  </div>
                  <div className="text-orange-600 dark:text-orange-400">
                    {Math.round(progress.memoryUsage.percentage)}%
                  </div>
                </div>
              )}
            </div>
          )}

          {state === 'ready' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">ZIP พร้อมแล้ว!</p>
                <p className="text-sm text-muted-foreground">
                  สร้าง QR Code สำเร็จ {processingInfo.estimatedBatches} ไฟล์
                  สำหรับ {trees.length} ต้น
                </p>
              </div>
            </div>
          )}

          {state === 'error' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-destructive">เกิดข้อผิดพลาดในการสร้าง PDF</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          )}

          {state === 'cancelled' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-yellow-700">การสร้าง PDF ถูกยกเลิก</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {state === 'configuring' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                ยกเลิก
              </Button>
              <Button onClick={handleGenerate} className="gap-2">
                <Zap className="h-4 w-4" />
                สร้างและดาวน์โหลด
              </Button>
            </>
          )}

          {state === 'generating' && (
            <Button variant="destructive" onClick={handleCancel}>
              หยุดการสร้าง
            </Button>
          )}

          {state === 'ready' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                ปิด
              </Button>
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                ดาวน์โหลด ZIP
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

          {state === 'cancelled' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                ปิด
              </Button>
              <Button onClick={handleGenerate}>
                ลองใหม่
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}