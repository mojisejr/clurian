'use server';

import { revalidatePath } from 'next/cache';
import * as treeService from '@/lib/services/tree-service';
import { Tree, TreeStatus } from '@/lib/types';
import { requireAuth } from '@/lib/auth-helpers';

export async function createTreeServer(data: Tree) {
  await requireAuth(); // Ensure user is authenticated
  const result = await treeService.createTree(data);

  // Invalidate the dashboard page
  revalidatePath('/dashboard');

  // TODO: Implement revalidateTag when properly configured
  // revalidateTag(`orchard-${data.orchardId}`);
  // revalidateTag(`trees-${data.orchardId}`);
  // revalidateTag('orchard-list');

  return result;
}

export async function updateTreeStatusServer(treeId: string, status: TreeStatus) {
  await requireAuth(); // Ensure user is authenticated

  // Get tree data to find orchardId for tag invalidation
  const tree = await treeService.getTreeById(treeId);
  await treeService.updateTreeStatus(treeId, status);

  // Invalidate the dashboard page
  revalidatePath('/dashboard');

  // TODO: Implement revalidateTag when properly configured
  // if (tree?.orchardId) {
  //   revalidateTag(`orchard-${tree.orchardId}`);
  //   revalidateTag(`trees-${tree.orchardId}`);
  // }

  return tree;
}

export async function archiveTreeServer(treeId: string, newCode: string) {
  await requireAuth(); // Ensure user is authenticated

  // Get tree data to find orchardId for tag invalidation
  const tree = await treeService.getTreeById(treeId);
  await treeService.archiveTree(treeId, newCode);

  // Invalidate the dashboard page
  revalidatePath('/dashboard');

  // TODO: Implement revalidateTag when properly configured
  // if (tree?.orchardId) {
  //   revalidateTag(`orchard-${tree.orchardId}`);
  //   revalidateTag(`trees-${tree.orchardId}`);
  // }

  return tree;
}
