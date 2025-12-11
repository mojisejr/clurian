import { prisma } from '@/lib/prisma';
import { Tree, TreeStatus } from '@/lib/types';
import { treeStatusToUI, treeStatusFromUI } from '@/lib/domain/mappers';
import { addZoneToOrchard } from './orchard-service';
import { handleServiceError } from '@/lib/errors';

export async function createTree(data: Tree): Promise<Tree | null> {
  try {
      // Check if orchard needs zone update
      await addZoneToOrchard(data.orchardId, data.zone);

      const tree = await prisma.tree.create({
          data: {
              orchardId: data.orchardId,
              code: data.code,
              zone: data.zone,
              type: data.type,
              variety: data.variety,
              plantedDate: data.plantedDate ? new Date(data.plantedDate) : null,
              status: treeStatusFromUI(data.status) // Convert UI status to DB status
          }
      });

      // Cache invalidation will be handled by the cache tags and revalidation times

      return {
          ...data,
          id: tree.id,
          status: data.status // Keep UI status in response
      };
  } catch (error) {
      handleServiceError(error, 'createTree');
      return null;
  }
}

export async function updateTreeStatus(treeId: string, status: TreeStatus) {
    try {
        await prisma.tree.update({
            where: { id: treeId },
            data: { status: status }
        });

        // Cache invalidation will be handled by the cache tags and revalidation times
    } catch (error) {
        handleServiceError(error, 'updateTreeStatus');
    }
}

export async function archiveTree(treeId: string, newCode: string) {
    try {
        await prisma.tree.update({
            where: { id: treeId },
            data: {
                status: 'ARCHIVED',
                code: newCode
            }
        });

        // Cache invalidation will be handled by the cache tags and revalidation times
    } catch (error) {
        handleServiceError(error, 'archiveTree');
    }
}

export async function getOrchardTrees(
    orchardId: string,
    page: number = 1,
    limit: number = 20,
    filters?: {
        status?: TreeStatus;
        zone?: string;
        searchTerm?: string;
    }
) {
    try {
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Record<string, unknown> = { orchardId };

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.zone) {
            where.zone = filters.zone;
        }

        if (filters?.searchTerm) {
            (where as Record<string, unknown>).OR = [
                { code: { contains: filters.searchTerm, mode: 'insensitive' } },
                { variety: { contains: filters.searchTerm, mode: 'insensitive' } }
            ];
        }

        // Execute queries in parallel for efficiency
        const [trees, total] = await Promise.all([
            prisma.tree.findMany({
                where,
                select: {
                    id: true,
                    orchardId: true,
                    code: true,
                    zone: true,
                    type: true,
                    variety: true,
                    plantedDate: true,
                    status: true,
                    createdAt: true
                },
                orderBy: [
                    { status: 'asc' }, // Show sick trees first
                    { code: 'asc' }
                ],
                skip,
                take: limit
            }),
            prisma.tree.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            trees: trees.map(tree => ({
                id: tree.id,
                orchardId: tree.orchardId,
                code: tree.code,
                zone: tree.zone,
                type: tree.type,
                variety: tree.variety,
                plantedDate: tree.plantedDate?.toISOString().split('T')[0] || null,
                status: treeStatusToUI(tree.status),
                createdAt: tree.createdAt.toISOString()
            })) as Tree[],
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
        handleServiceError(error, 'getOrchardTrees');
        return {
            trees: [],
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
