// Tree status types (matching Prisma schema)
export type TreeStatus = "HEALTHY" | "SICK" | "DEAD" | "ARCHIVED";

// Log types (matching Prisma schema)
export type LogType = "INDIVIDUAL" | "BATCH";
export type LogStatus = "COMPLETED" | "IN_PROGRESS";

// Core data models
export interface Tree {
  id: string;
  orchardId: string;
  code: string;
  zone: string;
  type: string; // e.g., 'ทุเรียน', 'มังคุด'
  variety: string; // e.g., 'หมอนทอง', 'ก้านยาว'
  plantedDate?: string; // ISO date string, optional in schema
  status: TreeStatus;
  replacedTreeId?: string;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

export interface Orchard {
  id: string;
  ownerId: string;
  name: string;
  zones: string[];
  createdAt: string; // ISO datetime string
}

export interface Log {
  id: string;
  orchardId: string;
  logType: LogType;
  treeId?: string; // for individual logs
  targetZone?: string; // for batch logs
  action: string;
  note?: string;
  performDate: string; // ISO date string
  status: LogStatus;
  followUpDate?: string; // ISO date string
  createdAt: string; // ISO datetime string
}

// Form data types
export interface AddTreeFormData {
  isNewZone: boolean;
  isCustomType: boolean;
  isCustomVariety: boolean;
}

export interface AddLogFormData {
  isCustomAction: boolean;
}

// UI state types
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Dashboard stats
export interface DashboardStats {
  totalTrees: number;
  healthyTrees: number;
  sickTrees: number;
  deadTrees: number;
  pendingFollowUps: number;
}
