import { TreeStatus, LogStatus, LogType, Tree, Log } from '@/lib/types';
import { Tree as PrismaTree, ActivityLog as PrismaLog } from '@prisma/client';

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
  status: mapTreeStatus(t.status),
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
  createdAt: l.createdAt.toISOString()
});
