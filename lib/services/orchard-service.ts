import { prisma } from '@/lib/prisma';
import { Orchard, Tree, Log } from '@/lib/types';
import { mapPrismaTreeToDomain, mapPrismaLogToDomain } from '@/lib/domain/mappers';
import { handleServiceError } from '@/lib/errors';

export async function getOrchards(userId: string): Promise<Orchard[]> {
  try {
      const orchards = await prisma.orchard.findMany({
          where: { ownerId: userId },
          orderBy: { createdAt: 'desc' }
      });

      return orchards.map(o => ({
          id: o.id,
          ownerId: o.ownerId,
          name: o.name,
          zones: o.zones as string[],
          createdAt: o.createdAt.toISOString()
      }));
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

export async function getOrchardData(orchardId: string) {
  try {
      const trees = await prisma.tree.findMany({
          where: { orchardId },
          orderBy: { createdAt: 'desc' }
      });

      const logs = await prisma.activityLog.findMany({
          where: { orchardId },
          orderBy: { performDate: 'desc' }
      });

      return {
          trees: trees.map(mapPrismaTreeToDomain) as Tree[],
          logs: logs.map(mapPrismaLogToDomain) as Log[]
      };
  } catch (error) {
      handleServiceError(error, 'getOrchardData');
      return { trees: [], logs: [] };
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
        }
    }
}
