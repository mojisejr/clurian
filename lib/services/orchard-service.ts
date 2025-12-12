import { prisma } from '@/lib/prisma';
import { Orchard, Tree, Log } from '@/lib/types';
import { mapPrismaTreeToDomain, mapPrismaLogToDomain } from '@/lib/domain/mappers';
import { handleServiceError } from '@/lib/errors';
import { getCachedOrchards } from './cached-services';
import {
  createPaginationMetadata,
  calculateSkip,
  validatePaginationParams,
  PAGINATION_OPTIONS
} from '@/lib/utils/pagination';

export async function getOrchards(userId: string): Promise<Orchard[]> {
  try {
      return await getCachedOrchards(userId);
  } catch (error) {
      handleServiceError(error, 'getOrchards');
      return [];
  }
}

export async function createOrchard(userId: string, name: string): Promise<Orchard | null> {
  try {
      const orchard = await prisma.orchard.create({
          data: {
              name,
              ownerId: userId,
              zones: ["A"] // Default zone
          }
      });

      // Cache invalidation will be handled by the cache tags and revalidation times

      return {
          id: orchard.id,
          ownerId: orchard.ownerId,
          name: orchard.name,
          zones: orchard.zones as string[],
          createdAt: orchard.createdAt.toISOString()
      };
  } catch (error) {
      handleServiceError(error, 'createOrchard');
      return null;
  }
}

export interface GetOrchardDataOptions {
  page?: number;
  limit?: number;
  filters?: {
    zone?: string;
    status?: string;
    searchTerm?: string;
  };
}

export async function getOrchardData(
    orchardId: string,
    options: GetOrchardDataOptions = {}
) {
  try {
      // Validate and normalize pagination parameters
      const { page, limit } = validatePaginationParams(
        options.page || 1,
        options.limit || PAGINATION_OPTIONS.DASHBOARD.limit
      );

      const skip = calculateSkip(page, limit);

      // Build where clause for trees
      const treeWhere: Record<string, unknown> = { orchardId };

      // Apply filters if provided
      if (options.filters) {
          if (options.filters.zone && options.filters.zone !== 'ALL') {
              treeWhere.zone = options.filters.zone;
          }

          if (options.filters.status && options.filters.status !== 'ALL') {
              // Convert UI status to database status
              const dbStatus = options.filters.status.toUpperCase();
              treeWhere.status = dbStatus;
          }

          if (options.filters.searchTerm) {
              treeWhere.OR = [
                  { code: { contains: options.filters.searchTerm, mode: 'insensitive' } },
                  { variety: { contains: options.filters.searchTerm, mode: 'insensitive' } }
              ];
          }
      }

      // Use parallel queries for better performance
      const [trees, totalTrees, logs] = await Promise.all([
          prisma.tree.findMany({
              where: treeWhere,
              select: {
                  id: true,
                  orchardId: true,
                  code: true,
                  zone: true,
                  type: true,
                  variety: true,
                  plantedDate: true,
                  status: true,
                  replacedTreeId: true,
                  createdAt: true,
                  updatedAt: true
              },
              orderBy: [
                  { status: 'asc' }, // Show sick trees first
                  { createdAt: 'desc' }
              ],
              skip,
              take: limit
          }),
          prisma.tree.count({ where: treeWhere }),
          prisma.activityLog.findMany({
              where: { orchardId },
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
                  mixingFormulaId: true
              },
              orderBy: { performDate: 'desc' },
              take: 50 // Limit recent logs for performance
          })
      ]);

      const pagination = createPaginationMetadata(page, limit, totalTrees);

      return {
          trees: trees.map(mapPrismaTreeToDomain) as Tree[],
          logs: logs.map(mapPrismaLogToDomain) as Log[],
          pagination
      };
  } catch (error) {
      // More specific error handling
      if (error instanceof Error && error.message.includes('Prisma')) {
          handleServiceError(error, 'getOrchardData (Database Error)');
      } else if (error instanceof Error && error.message.includes('validation')) {
          handleServiceError(error, 'getOrchardData (Validation Error)');
      } else {
          handleServiceError(error, 'getOrchardData');
      }

      const { page, limit } = validatePaginationParams(
        options.page || 1,
        options.limit || PAGINATION_OPTIONS.DASHBOARD.limit
      );

      return {
          trees: [],
          logs: [],
          pagination: createPaginationMetadata(page, limit, 0)
      };
  }
}

/**
 * Legacy compatibility function for backward compatibility
 * @deprecated Use getOrchardData with options object instead
 */
export async function getOrchardDataLegacy(
  orchardId: string,
  page: number = 1,
  limit: number = 100
) {
  return getOrchardData(orchardId, { page, limit });
}

export async function addZoneToOrchard(orchardId: string, zone: string) {
    const orchard = await prisma.orchard.findUnique({ where: { id: orchardId } });
    if (orchard) {
        const currentZones = orchard.zones as string[];
        if (!currentZones.includes(zone)) {
            await prisma.orchard.update({
                where: { id: orchardId },
                data: { zones: [...currentZones, zone].sort() }
            });

            // Cache invalidation will be handled by the cache tags and revalidation times
        }
    }
}
