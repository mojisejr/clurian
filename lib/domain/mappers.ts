import { TreeStatus, LogStatus, LogType } from '@/lib/types';
import { Tree as PrismaTree, ActivityLog as PrismaLog } from '@prisma/client';

export const mapTreeStatus = (status: string): TreeStatus => {
  return status.toLowerCase() as TreeStatus;
};

export const mapLogStatus = (status: string): LogStatus => {
  return (status === 'IN_PROGRESS' ? 'in-progress' : 'completed');
};

export const mapLogType = (type: string): LogType => {
  return type.toLowerCase() as LogType;
};

export const mapPrismaTreeToDomain = (t: PrismaTree) => ({
  id: t.id,
  orchardId: t.orchardId,
  code: t.code,
  zone: t.zone,
  type: t.type,
  variety: t.variety,
  plantedDate: t.plantedDate ? t.plantedDate.toISOString().split('T')[0] : '',
  status: mapTreeStatus(t.status)
});

export const mapPrismaLogToDomain = (l: PrismaLog) => ({
  id: l.id,
  orchardId: l.orchardId,
  type: mapLogType(l.logType),
  zone: l.targetZone || undefined,
  treeId: l.treeId || undefined,
  action: l.action,
  date: l.performDate.toISOString().split('T')[0],
  note: l.note || '',
  status: mapLogStatus(l.status),
  followUpDate: l.followUpDate ? l.followUpDate.toISOString().split('T')[0] : undefined
});
