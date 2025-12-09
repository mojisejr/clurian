// Tree status types
export type TreeStatus = "healthy" | "sick" | "dead" | "archived";

// Log types
export type LogType = "batch" | "individual";
export type LogStatus = "completed" | "in-progress";

// Core data models
export interface Tree {
  id: string;
  orchardId: string;
  code: string;
  zone: string;
  type: string; // e.g., 'ทุเรียน', 'มังคุด'
  variety: string; // e.g., 'หมอนทอง', 'ก้านยาว'
  plantedDate: string; // ISO date string
  status: TreeStatus;
}

export interface Orchard {
  id: string;
  name: string;
  zones: string[];
}

export interface Log {
  id: number | string;
  orchardId: string;
  type: LogType;
  zone?: string; // for batch logs
  treeId?: string; // for individual logs
  action: string;
  date: string; // ISO date string
  note: string;
  status: LogStatus;
  followUpDate?: string; // ISO date string
  materials?: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>;
  labor?: {
    workers: number;
    hours: number;
  };
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
