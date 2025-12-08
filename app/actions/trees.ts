'use server';

import { revalidatePath } from 'next/cache';
import * as treeService from '@/lib/services/tree-service';
import { Tree, TreeStatus } from '@/lib/types';
import { requireAuth } from '@/lib/auth-helpers';

export async function createTreeServer(data: Tree) {
  await requireAuth(); // Ensure user is authenticated
  const result = await treeService.createTree(data);
  revalidatePath('/dashboard');
  return result;
}

export async function updateTreeStatusServer(treeId: string, status: TreeStatus) {
  await requireAuth(); // Ensure user is authenticated
  await treeService.updateTreeStatus(treeId, status);
  revalidatePath('/dashboard');
}

export async function archiveTreeServer(treeId: string, newCode: string) {
  await requireAuth(); // Ensure user is authenticated
  await treeService.archiveTree(treeId, newCode);
  revalidatePath('/dashboard');
}
