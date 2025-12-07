import { prisma } from '@/lib/prisma';
import { Log } from '@/lib/types';
import { handleServiceError } from '@/lib/errors';
import { LogType as PrismaLogType, LogStatus as PrismaLogStatus } from '@prisma/client';

export async function createLog(data: Log): Promise<Log | null> {
    try {
        const log = await prisma.activityLog.create({
            data: {
                orchardId: data.orchardId,
                logType: data.type.toUpperCase() as PrismaLogType,
                treeId: data.treeId,
                targetZone: data.zone,
                action: data.action,
                note: data.note,
                performDate: new Date(data.date),
                status: (data.status === 'in-progress' ? 'IN_PROGRESS' : 'COMPLETED') as PrismaLogStatus,
                followUpDate: data.followUpDate ? new Date(data.followUpDate) : null
            }
        });
        
        return {
            ...data,
            id: log.id
        };
    } catch (error) {
        handleServiceError(error, 'createLog');
        return null;
    }
}

export async function updateLog(log: Log) {
    try {
        await prisma.activityLog.update({
            where: { id: String(log.id) },
            data: {
                status: (log.status === 'in-progress' ? 'IN_PROGRESS' : 'COMPLETED'),
                note: log.note,
                // Add other fields as needed
            }
        });
    } catch (error) {
        handleServiceError(error, 'updateLog');
    }
}
