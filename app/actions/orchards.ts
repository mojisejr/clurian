'use server';

import { revalidatePath } from 'next/cache';
import * as orchardService from '@/lib/services/orchard-service';

export async function getOrchards() {
  return orchardService.getOrchards();
}

export async function createOrchard(name: string) {
  const result = await orchardService.createOrchard(name);
  revalidatePath('/dashboard');
  return result;
}

export async function getOrchardData(orchardId: string) {
  return orchardService.getOrchardData(orchardId);
}
