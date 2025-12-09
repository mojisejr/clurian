import type { TreeStatus, LogStatus } from "./types";

// Pagination
export const ITEMS_PER_PAGE = 10;

// Tree statuses with display configuration
export const TREE_STATUSES = ["HEALTHY", "SICK", "DEAD", "ARCHIVED"] as const;

export const STATUS_CONFIG: Record<
  TreeStatus,
  {
    label: string;
    variant: "secondary" | "accent" | "destructive" | "muted";
  }
> = {
  HEALTHY: { label: "ปกติ", variant: "secondary" },
  SICK: { label: "ป่วย/ดูแล", variant: "accent" },
  DEAD: { label: "ตาย", variant: "destructive" },
  ARCHIVED: { label: "Archive", variant: "muted" },
};

export const LOG_STATUS_CONFIG: Record<
  LogStatus,
  {
    label: string;
    variant: "success" | "warning";
  }
> = {
  COMPLETED: { label: "เสร็จสิ้น", variant: "success" },
  IN_PROGRESS: { label: "รอติดตาม", variant: "warning" },
};

// Tree types (fruit types)
export const TREE_TYPES = ["ทุเรียน", "มังคุด", "เงาะ", "ลองกอง", "ลำไย"] as const;

// Durian varieties
export const DURIAN_VARIETIES = [
  "หมอนทอง",
  "ก้านยาว",
  "ชะนี",
  "พวงมณี",
  "นกหยิบ",
  "กระดุม",
  "หลงลับแล",
] as const;

// Common log actions
export const LOG_ACTIONS = [
  "ใส่ปุ๋ย",
  "พ่นยา/ฮอร์โมน",
  "ตัดแต่งกิ่ง",
  "รักษาโรค/ทายา",
  "ให้น้ำ",
  "ตรวจสอบสภาพ",
  "เก็บเกี่ยว",
] as const;

// Fertilizer formulas (common in Thailand)
export const FERTILIZER_FORMULAS = [
  "15-15-15",
  "16-16-16",
  "46-0-0",
  "0-0-60",
  "8-24-24",
  "13-13-21",
] as const;

// Filter options
export const ZONE_FILTER_ALL = "All";

// Date format options for Thai locale
export const THAI_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "2-digit",
  month: "short",
  day: "numeric",
};

export const THAI_DATETIME_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "2-digit",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};
