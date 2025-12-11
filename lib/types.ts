// Import TreeStatus from Prisma to ensure consistency
import { TreeStatus as PrismaTreeStatus } from '@prisma/client';

// Use Prisma's TreeStatus enum directly
export type TreeStatus = PrismaTreeStatus;

// UI-friendly lowercase status values
export type UITreeStatus = 'healthy' | 'sick' | 'dead' | 'archived';

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
  status: UITreeStatus; // UI-friendly lowercase status
  replacedTreeId?: string;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

// Database Tree model (for internal use)
export interface TreeDB {
  id: string;
  orchardId: string;
  code: string;
  zone: string;
  type: string;
  variety: string;
  plantedDate?: string;
  status: TreeStatus; // Database uppercase status
  replacedTreeId?: string;
  createdAt: string;
  updatedAt: string;
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
