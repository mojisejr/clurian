import { prisma } from '@/lib/prisma';
import { handleServiceError } from '@/lib/errors';
import { getCachedOrchardStats } from './cached-services';
import { getOrchardTrees } from './tree-service';
import { getOrchardActivityLogs, getUpcomingFollowUps } from './activity-service';

// Optimized dashboard data fetch with parallel queries
export async function getDashboardData(orchardId: string, userId: string) {
    try {
        // Execute all queries in parallel for maximum efficiency
        const [
            orchard,
            stats,
            treesData,
            recentLogs,
            upcomingFollowUps,
            batchActivityCount,
            scheduledActivityCount
        ] = await Promise.all([
            // Basic orchard info (minimal fields)
            prisma.orchard.findUnique({
                where: { id: orchardId, ownerId: userId },
                select: {
                    id: true,
                    name: true,
                    zones: true,
                    createdAt: true
                }
            }),
            // Cached statistics
            getCachedOrchardStats(orchardId),
            // Paginated trees (first page only)
            getOrchardTrees(orchardId, 1, 20),
            // Recent activity logs
            getOrchardActivityLogs(orchardId, 1, 10),
            // Upcoming follow-ups
            getUpcomingFollowUps(orchardId, 5),
            // Batch activity count (optimized with just count)
            prisma.activityLog.count({
                where: {
                    orchardId,
                    logType: 'BATCH',
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                    }
                }
            }),
            // Scheduled activities count
            prisma.activityLog.count({
                where: {
                    orchardId,
                    followUpDate: {
                        gte: new Date()
                    },
                    status: 'IN_PROGRESS'
                }
            })
        ]);

        if (!orchard) {
            throw new Error('Orchard not found');
        }

        return {
            orchard: {
                ...orchard,
                zones: orchard.zones as string[]
            },
            stats,
            trees: treesData.trees,
            treesPagination: treesData.pagination,
            recentLogs: recentLogs.logs,
            upcomingFollowUps,
            batchActivityCount,
            scheduledActivityCount,
            // Add quick access to filters
            filters: {
                zones: orchard.zones as string[],
                hasSickTrees: stats.sickTrees > 0,
                hasPendingFollowUps: scheduledActivityCount > 0
            }
        };
    } catch (error) {
        handleServiceError(error, 'getDashboardData');
        return null;
    }
}

// Get trees with pagination for dashboard
export async function getDashboardTrees(
    orchardId: string,
    page: number = 1,
    filters?: {
        status?: string;
        zone?: string;
        searchTerm?: string;
    }
) {
    try {
        const prismaFilters: Record<string, unknown> = { orchardId };

        if (filters?.status && filters.status !== 'all') {
            prismaFilters.status = filters.status.toUpperCase();
        }

        if (filters?.zone && filters.zone !== 'all') {
            prismaFilters.zone = filters.zone;
        }

        if (filters?.searchTerm) {
            (prismaFilters as Record<string, unknown>).OR = [
                { code: { contains: filters.searchTerm, mode: 'insensitive' } },
                { variety: { contains: filters.searchTerm, mode: 'insensitive' } }
            ];
        }

        const skip = (page - 1) * 20;

        const [trees, total] = await Promise.all([
            prisma.tree.findMany({
                where: prismaFilters,
                select: {
                    id: true,
                    code: true,
                    zone: true,
                    type: true,
                    variety: true,
                    plantedDate: true,
                    status: true,
                    updatedAt: true
                },
                orderBy: [
                    { status: 'asc' }, // Sick trees first
                    { code: 'asc' }
                ],
                skip,
                take: 20
            }),
            prisma.tree.count({ where: prismaFilters })
        ]);

        return {
            trees,
            pagination: {
                page,
                limit: 20,
                total,
                totalPages: Math.ceil(total / 20),
                hasNext: page < Math.ceil(total / 20),
                hasPrev: page > 1
            }
        };
    } catch (error) {
        handleServiceError(error, 'getDashboardTrees');
        return {
            trees: [],
            pagination: {
                page,
                limit: 20,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrev: false
            }
        };
    }
}