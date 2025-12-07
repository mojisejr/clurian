import { prisma } from '@/lib/prisma';
import { Orchard, Tree, Log } from '@/lib/types';
import { mapPrismaTreeToDomain, mapPrismaLogToDomain } from '@/lib/domain/mappers';
import { handleServiceError } from '@/lib/errors';

// Hardcoded user ID for now as requested (assuming single user context/MVP)
const DEMO_USER_ID = "cm458x2z30000356sl1234567"; 

async function ensureDemoUser() {
  let user = await prisma.user.findUnique({ where: { id: DEMO_USER_ID } });
  if (!user) {
      user = await prisma.user.create({
          data: {
              id: DEMO_USER_ID,
              name: "Demo User",
              email: "demo@clurian.com"
          }
      });
  }
  return user;
}

export async function getOrchards(): Promise<Orchard[]> {
  try {
      await ensureDemoUser();

      const orchards = await prisma.orchard.findMany({
          where: { ownerId: DEMO_USER_ID },
          orderBy: { createdAt: 'desc' }
      });

      return orchards.map(o => ({
          id: o.id,
          name: o.name,
          zones: o.zones as string[]
      }));
  } catch (error) {
      handleServiceError(error, 'getOrchards');
      return [];
  }
}

export async function createOrchard(name: string): Promise<Orchard | null> {
  try {
      const orchard = await prisma.orchard.create({
          data: {
              name,
              ownerId: DEMO_USER_ID,
              zones: ["A"] // Default zone
          }
      });
      return {
          id: orchard.id,
          name: orchard.name,
          zones: orchard.zones as string[]
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
