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

export async function getTreeById(treeId: string) {
    try {
        const tree = await prisma.tree.findUnique({
            where: { id: treeId },
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
            }
        });

        if (!tree) {
            return null;
        }

        return {
            id: tree.id,
            orchardId: tree.orchardId,
            code: tree.code,
            zone: tree.zone,
            type: tree.type,
            variety: tree.variety,
            plantedDate: tree.plantedDate?.toISOString().split('T')[0] || undefined,
            status: treeStatusToUI(tree.status),
            createdAt: tree.createdAt.toISOString()
        } as Tree;
    } catch (error) {
        handleServiceError(error, 'getTreeById');
        return null;
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
    // Import the database-level sorting implementation
    const { getOrchardTreesSorted } = await import('./tree-service-db');

    return getOrchardTreesSorted({
        orchardId,
        page,
        limit,
        filters
    });
}