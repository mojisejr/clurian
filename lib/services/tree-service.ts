import { prisma } from '@/lib/prisma';
import { Tree, TreeStatus } from '@/lib/types';
import { addZoneToOrchard } from './orchard-service';
import { handleServiceError } from '@/lib/errors';
import { TreeStatus as PrismaTreeStatus } from '@prisma/client';

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
              plantedDate: new Date(data.plantedDate),
              status: data.status.toUpperCase() as PrismaTreeStatus
          }
      });
      
      return {
          ...data,
          id: tree.id
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
            data: { status: status.toUpperCase() as PrismaTreeStatus }
        });
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
    } catch (error) {
        handleServiceError(error, 'archiveTree');
    }
}
