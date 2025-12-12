import { prisma } from '@/lib/prisma';
import { Orchard, Tree, Log } from '@/lib/types';
import { mapPrismaTreeToDomain, mapPrismaLogToDomain } from '@/lib/domain/mappers';
import { handleServiceError } from '@/lib/errors';
import { getCachedOrchards } from './cached-services';

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

export async function getOrchardData(
    orchardId: string,
    page: number = 1,
    limit: number = 100
) {
  try {
      const skip = (page - 1) * limit;

      // Use parallel queries instead of sequential
      const [trees, totalTrees, logs] = await Promise.all([
          prisma.tree.findMany({
              where: { orchardId },
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
              take: limit // Use dynamic limit instead of hardcoded 100
          }),
          prisma.tree.count({
              where: { orchardId }
          }),
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
              take: 50 // Limit recent logs
          })
      ]);

      const totalPages = Math.ceil(totalTrees / limit);

      return {
          trees: trees.map(mapPrismaTreeToDomain) as Tree[],
          logs: logs.map(mapPrismaLogToDomain) as Log[],
          pagination: {
              page,
              limit,
              total: totalTrees,
              totalPages,
              hasNext: page < totalPages,
              hasPrev: page > 1
          }
      };
  } catch (error) {
      handleServiceError(error, 'getOrchardData');
      return {
          trees: [],
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
