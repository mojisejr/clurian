"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Pagination - Page navigation with item count display
 *
 * @example
 * <Pagination
 *   currentPage={1}
 *   totalPages={5}
 *   totalItems={50}
 *   itemsPerPage={10}
 *   onPageChange={(page) => setCurrentPage(page)}
 * />
 */
export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Navigation controls */}
      <div className="flex justify-center items-center gap-4 text-sm text-foreground">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 w-9 rounded-full"
          aria-label="หน้าก่อนหน้า"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="font-medium">
          หน้า {currentPage} / {totalPages}
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 rounded-full"
          aria-label="หน้าถัดไป"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Item count */}
      <div className="text-center text-xs text-muted-foreground">
        แสดง {startItem} - {endItem} จาก {totalItems} ต้น
      </div>
    </div>
  );
}
