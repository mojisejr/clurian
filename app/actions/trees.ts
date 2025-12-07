'use server';

import { revalidatePath } from 'next/cache';
import * as treeService from '@/lib/services/tree-service';
import { Tree, TreeStatus } from '@/lib/types';

export async function createTreeServer(data: Tree) {
  const result = await treeService.createTree(data);
  revalidatePath('/dashboard');
  return result;
}

export async function updateTreeStatusServer(treeId: string, status: TreeStatus) {
  await treeService.updateTreeStatus(treeId, status);
  revalidatePath('/dashboard');
}

export async function archiveTreeServer(treeId: string, newCode: string) {
  await treeService.archiveTree(treeId, newCode);
  revalidatePath('/dashboard');
}
