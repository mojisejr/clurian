import { prisma } from '@/lib/prisma';
import { Log } from '@/lib/types';
import { handleServiceError } from '@/lib/errors';

export async function createLog(data: Log): Promise<Log | null> {
    try {
        const log = await prisma.activityLog.create({
            data: {
                orchardId: data.orchardId,
                logType: data.logType,
                treeId: data.treeId,
                targetZone: data.targetZone,
                action: data.action,
                note: data.note,
                performDate: new Date(data.performDate),
                status: data.status,
                followUpDate: data.followUpDate ? new Date(data.followUpDate) : null
            }
        });

        return {
            ...data,
            id: log.id,
            createdAt: log.createdAt.toISOString()
        };
    } catch (error) {
        handleServiceError(error, 'createLog');
        return null;
    }
}

export async function updateLog(log: Log) {
    try {
        await prisma.activityLog.update({
            where: { id: log.id },
            data: {
                status: log.status,
                note: log.note,
                action: log.action,
                followUpDate: log.followUpDate ? new Date(log.followUpDate) : null
                // Add other fields as needed
            }
        });
    } catch (error) {
        handleServiceError(error, 'updateLog');
    }
}
