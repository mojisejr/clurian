import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to Thai locale (e.g., "6 ธ.ค. 68")
 */
export function formatThaiDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "2-digit",
    month: "short",
    day: "numeric",
  });
}

/**
 * Calculate days remaining until target date
 * Returns text and variant for styling
 */
export function getDaysRemaining(targetDateString: string | null | undefined): {
  text: string;
  variant: "destructive" | "warning" | "success";
} | null {
  if (!targetDateString) return null;

  const target = new Date(targetDateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `เกิน ${Math.abs(diffDays)} วัน`, variant: "destructive" };
  }
  if (diffDays === 0) {
    return { text: "วันนี้", variant: "warning" };
  }
  return { text: `อีก ${diffDays} วัน`, variant: "success" };
}

/**
 * Calculate tree age from planted date
 */
export function getTreeAge(plantedDate: string | null | undefined): string {
  if (!plantedDate) return "-";

  const planted = new Date(plantedDate);
  const today = new Date();
  
  const years = today.getFullYear() - planted.getFullYear();
  const months = today.getMonth() - planted.getMonth();
  
  const totalMonths = years * 12 + months;
  
  if (totalMonths < 12) {
    return `${totalMonths} เดือน`;
  }
  
  const fullYears = Math.floor(totalMonths / 12);
  const remainingMonths = totalMonths % 12;
  
  if (remainingMonths === 0) {
    return `${fullYears} ปี`;
  }
  return `${fullYears} ปี ${remainingMonths} เดือน`;
}
