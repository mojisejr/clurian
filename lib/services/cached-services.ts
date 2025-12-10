import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

// Cache orchards for 1 hour - frequently accessed data
export const getCachedOrchards = unstable_cache(
  async (userId: string) => {
    console.log('Fetching orchards from database for user:', userId);
    const orchards = await prisma.orchard.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        zones: true,
        createdAt: true
      }
    });

    return orchards.map(o => ({
      id: o.id,
      ownerId: userId,
      name: o.name,
      zones: o.zones as string[],
      createdAt: o.createdAt.toISOString()
    }));
  },
  ['orchards'],
  {
    revalidate: 3600, // 1 hour
    tags: ['orchards']
  }
);

// Cache tree types for 24 hours - static data that rarely changes
export const getCachedTreeTypes = unstable_cache(
  async () => {
    console.log('Fetching tree types from database');
    // Get distinct tree types from existing trees
    const types = await prisma.tree.findMany({
      select: {
        type: true
      },
      distinct: ['type']
    });

    return types.map(t => t.type).filter(Boolean);
  },
  ['tree-types'],
  {
    revalidate: 86400, // 24 hours
    tags: ['tree-types']
  }
);

// Cache tree varieties for 24 hours - static data
export const getCachedTreeVarieties = unstable_cache(
  async () => {
    console.log('Fetching tree varieties from database');
    const varieties = await prisma.tree.findMany({
      select: {
        variety: true
      },
      distinct: ['variety']
    });

    return varieties.map(v => v.variety).filter(Boolean);
  },
  ['tree-varieties'],
  {
    revalidate: 86400, // 24 hours
    tags: ['tree-varieties']
  }
);

// Cache orchard statistics for 15 minutes - computed data
export const getCachedOrchardStats = unstable_cache(
  async (orchardId: string) => {
    console.log('Computing orchard stats for:', orchardId);

    const [totalTrees, healthyTrees, sickTrees, recentLogs] = await Promise.all([
      prisma.tree.count({
        where: { orchardId }
      }),
      prisma.tree.count({
        where: { orchardId, status: 'HEALTHY' }
      }),
      prisma.tree.count({
        where: { orchardId, status: 'SICK' }
      }),
      prisma.activityLog.count({
        where: {
          orchardId,
          performDate: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ]);

    return {
      totalTrees,
      healthyTrees,
      sickTrees,
      recentActivityCount: recentLogs
    };
  },
  ['orchard-stats'],
  {
    revalidate: 900, // 15 minutes
    tags: ['orchard-stats']
  }
);