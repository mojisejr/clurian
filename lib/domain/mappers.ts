import { TreeStatus, LogStatus, LogType, Tree, Log } from '@/lib/types';
import { Tree as PrismaTree, ActivityLog as PrismaLog, TreeStatus as PrismaTreeStatus } from '@prisma/client';

// UI-friendly lowercase status values
export type UITreeStatus = 'healthy' | 'sick' | 'dead' | 'archived';

// Convert from Database (uppercase) to UI (lowercase)
export const treeStatusToUI = (status: TreeStatus | PrismaTreeStatus): UITreeStatus => {
  return status.toLowerCase() as UITreeStatus;
};

// Convert from UI (lowercase) to Database (uppercase)
export const treeStatusFromUI = (status: UITreeStatus): TreeStatus => {
  return status.toUpperCase() as TreeStatus;
};

// Check if a string is a valid UI status
export const isValidUIStatus = (status: string): status is UITreeStatus => {
  return ['healthy', 'sick', 'dead', 'archived'].includes(status);
};

// Check if a string is a valid TreeStatus
export const isValidTreeStatus = (status: string): status is TreeStatus => {
  return ['HEALTHY', 'SICK', 'DEAD', 'ARCHIVED'].includes(status);
};

export const mapTreeStatus = (status: string): TreeStatus => {
  return status as TreeStatus; // Direct mapping since enums match
};

export const mapLogStatus = (status: string): LogStatus => {
  return status as LogStatus; // Direct mapping since enums match
};

export const mapLogType = (type: string): LogType => {
  return type as LogType; // Direct mapping since enums match
};

export const mapPrismaTreeToDomain = (t: PrismaTree): Tree => ({
  id: t.id,
  orchardId: t.orchardId,
  code: t.code,
  zone: t.zone,
  type: t.type,
  variety: t.variety,
  plantedDate: t.plantedDate ? t.plantedDate.toISOString().split('T')[0] : undefined,
  status: treeStatusToUI(t.status), // Convert to lowercase for UI
  replacedTreeId: t.replacedTreeId || undefined,
  createdAt: t.createdAt.toISOString(),
  updatedAt: t.updatedAt.toISOString()
});

export const mapPrismaLogToDomain = (l: PrismaLog): Log => ({
  id: l.id,
  orchardId: l.orchardId,
  logType: mapLogType(l.logType),
  targetZone: l.targetZone || undefined,
  treeId: l.treeId || undefined,
  action: l.action,
  note: l.note || undefined,
  performDate: l.performDate.toISOString().split('T')[0],
  status: mapLogStatus(l.status),
  followUpDate: l.followUpDate ? l.followUpDate.toISOString().split('T')[0] : undefined,
  createdAt: l.createdAt.toISOString(),
  mixingFormulaId: l.mixingFormulaId || undefined
});
