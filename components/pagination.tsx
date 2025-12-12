"use client";

import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
  maxVisiblePages?: number;
  showPageNumbers?: boolean;
  showItemCount?: boolean;
  ariaLabel?: string;
}

/**
 * Accessible Pagination component with keyboard navigation and screen reader support
 *
 * @example
 * <Pagination
 *   currentPage={1}
 *   totalPages={5}
 *   totalItems={50}
 *   itemsPerPage={10}
 *   onPageChange={(page) => setCurrentPage(page)}
 *   ariaLabel="การนำทางหน้าต้นไม้"
 * />
 */
export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className,
  maxVisiblePages = 5,
  showPageNumbers = true,
  showItemCount = true,
  ariaLabel = "การนำทางหน้า",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show
  const getVisiblePages = () => {
    const pages: number[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let start = Math.max(1, currentPage - halfVisible);
    const end = Math.min(totalPages, start + maxVisiblePages - 1);

    // Adjust if we're near the end
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, page?: number) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (currentPage > 1) onPageChange(currentPage - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (currentPage < totalPages) onPageChange(currentPage + 1);
        break;
      case 'Home':
        e.preventDefault();
        onPageChange(1);
        break;
      case 'End':
        e.preventDefault();
        onPageChange(totalPages);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (page) onPageChange(page);
        break;
    }
  };

  // Announce page changes to screen readers
  React.useEffect(() => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `อยู่ที่หน้า ${currentPage} จาก ${totalPages} หน้า`;

    document.body.appendChild(announcement);
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [currentPage, totalPages]);

  return (
    <nav
      className={cn("space-y-2", className)}
      aria-label={ariaLabel}
      role="navigation"
    >
      {showPageNumbers && (
        /* Page number controls with full keyboard navigation */
        <div
          className="flex justify-center items-center gap-1 text-sm"
          role="tablist"
          aria-label="เลือกหน้า"
        >
          {/* First page button */}
          {visiblePages[0] > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(1)}
                className={cn(
                  "h-9 w-9 rounded-full",
                  currentPage === 1 && "bg-primary text-primary-foreground"
                )}
                aria-label="ไปหน้าแรก"
                aria-current={currentPage === 1 ? "page" : undefined}
                aria-selected={currentPage === 1}
                role="tab"
                tabIndex={currentPage === 1 ? -1 : 0}
                onKeyDown={(e) => handleKeyDown(e, 1)}
              >
                1
              </Button>
              {visiblePages[0] > 2 && (
                <span className="px-2 py-1" aria-hidden="true">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              )}
            </>
          )}

          {/* Visible page numbers */}
          {visiblePages.map((page) => (
            <Button
              key={page}
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page)}
              className={cn(
                "h-9 w-9 rounded-full",
                currentPage === page && "bg-primary text-primary-foreground"
              )}
              aria-label={`ไปหน้า ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
              aria-selected={currentPage === page}
              role="tab"
              tabIndex={currentPage === page ? -1 : 0}
              onKeyDown={(e) => handleKeyDown(e, page)}
            >
              {page}
            </Button>
          ))}

          {/* Last page button */}
          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className="px-2 py-1" aria-hidden="true">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(totalPages)}
                className={cn(
                  "h-9 w-9 rounded-full",
                  currentPage === totalPages && "bg-primary text-primary-foreground"
                )}
                aria-label={`ไปหน้าสุดท้าย (หน้า ${totalPages})`}
                aria-current={currentPage === totalPages ? "page" : undefined}
                aria-selected={currentPage === totalPages}
                role="tab"
                tabIndex={currentPage === totalPages ? -1 : 0}
                onKeyDown={(e) => handleKeyDown(e, totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>
      )}

      {/* Previous/Next navigation */}
      <div className="flex justify-center items-center gap-4 text-sm text-foreground">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 w-9 rounded-full"
          aria-label="หน้าก่อนหน้า"
          aria-disabled={currentPage === 1}
          onKeyDown={handleKeyDown}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span
          className="font-medium"
          aria-label={`หน้าปัจจุบันคือหน้า ${currentPage} จากทั้งหมด ${totalPages} หน้า`}
        >
          หน้า {currentPage} / {totalPages}
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 rounded-full"
          aria-label="หน้าถัดไป"
          aria-disabled={currentPage === totalPages}
          onKeyDown={handleKeyDown}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Item count with semantic markup */}
      {showItemCount && (
        <div
          className="text-center text-xs text-muted-foreground"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          แสดง {startItem} - {endItem} จากทั้งหมด {totalItems} ต้น
        </div>
      )}

      {/* Keyboard help text for screen readers */}
      <div className="sr-only" aria-label="คำแนะนำการใช้แป้นพิมพ์">
        <p>
          ใช้ปุ่มลูกศรซ้าย/ขวาเพื่อเลือกหน้า ปุ่ม Home ไปหน้าแรก ปุ่ม End ไปหน้าสุดท้าย
          และปุ่ม Enter หรือ Spacebar เพื่อเลือกหน้าที่ focus อยู่
        </p>
      </div>
    </nav>
  );
}
