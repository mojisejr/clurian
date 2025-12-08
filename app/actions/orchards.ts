'use server';

import { revalidatePath } from 'next/cache';
import * as orchardService from '@/lib/services/orchard-service';
import { requireAuth } from '@/lib/auth-helpers';

export async function getOrchards() {
  const userId = await requireAuth();
  return orchardService.getOrchards(userId);
}

export async function createOrchard(name: string) {
  const userId = await requireAuth();
  const result = await orchardService.createOrchard(userId, name);
  revalidatePath('/dashboard');
  return result;
}

export async function getOrchardData(orchardId: string) {
  await requireAuth(); // Ensure user is authenticated
  return orchardService.getOrchardData(orchardId);
}
