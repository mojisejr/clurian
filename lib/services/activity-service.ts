import { prisma } from '@/lib/prisma';
import { Log, LogType } from '@/lib/types';
import { handleServiceError } from '@/lib/errors';

export async function getOrchardActivityLogs(
    orchardId: string,
    page: number = 1,
    limit: number = 20,
    filters?: {
        logType?: LogType;
        zone?: string;
        dateFrom?: string;
        dateTo?: string;
    }
) {
    try {
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Record<string, unknown> = { orchardId };

        if (filters?.logType) {
            where.logType = filters.logType;
        }

        if (filters?.zone) {
            where.targetZone = filters.zone;
        }

        if (filters?.dateFrom || filters?.dateTo) {
            where.performDate = {};
            const performDate = where.performDate as Record<string, Date>;
            if (filters.dateFrom) {
                performDate.gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                performDate.lte = new Date(filters.dateTo);
            }
        }

        // Execute queries in parallel for efficiency
        const [logs, total] = await Promise.all([
            prisma.activityLog.findMany({
                where,
                select: {
                    id: true,
                    orchardId: true,
                    logType: true,
                    treeId: true,
                    targetZone: true,
                    action: true,
                    note: true,
                    performDate: true,
                    status: true,
                    followUpDate: true,
                    createdAt: true,
                    tree: {
                        select: {
                            id: true,
                            code: true
                        }
                    }
                },
                orderBy: { performDate: 'desc' },
                skip,
                take: limit
            }),
            prisma.activityLog.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            logs: logs.map(log => ({
                id: log.id,
                orchardId: orchardId,
                logType: log.logType as Log['logType'],
                treeId: log.treeId || undefined,
                targetZone: log.targetZone || undefined,
                action: log.action,
                note: log.note || '',
                performDate: log.performDate.toISOString().split('T')[0],
                status: log.status as Log['status'],
                followUpDate: log.followUpDate?.toISOString().split('T')[0] || null,
                createdAt: log.createdAt.toISOString()
            })) as Log[],
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
    } catch (error) {
        handleServiceError(error, 'getOrchardActivityLogs');
        return {
            logs: [],
            pagination: {
                page,
                limit,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrev: false
            }
        };
    }
}

export async function getUpcomingFollowUps(orchardId: string, limit: number = 10) {
    try {
        const logs = await prisma.activityLog.findMany({
            where: {
                orchardId,
                followUpDate: {
                    gte: new Date()
                },
                status: 'IN_PROGRESS'
            },
            select: {
                id: true,
                orchardId: true,
                logType: true,
                treeId: true,
                targetZone: true,
                action: true,
                note: true,
                performDate: true,
                status: true,
                followUpDate: true,
                tree: {
                    select: {
                        id: true,
                        code: true,
                        zone: true
                    }
                }
            },
            orderBy: { followUpDate: 'asc' },
            take: limit
        });

        return logs.map(log => ({
            id: log.id,
            orchardId: orchardId,
            logType: log.logType as Log['logType'],
            treeId: log.treeId || undefined,
            targetZone: log.targetZone || undefined,
            action: log.action,
            note: log.note || '',
            performDate: log.performDate.toISOString().split('T')[0],
            status: log.status as Log['status'],
            followUpDate: log.followUpDate?.toISOString().split('T')[0] || null,
            tree: log.tree ? {
                id: log.tree.id,
                code: log.tree.code,
                zone: log.tree.zone
            } : undefined
        }));
    } catch (error) {
        handleServiceError(error, 'getUpcomingFollowUps');
        return [];
    }
}