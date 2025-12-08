'use server';

import { revalidatePath } from 'next/cache';
import * as logService from '@/lib/services/log-service';
import { Log } from '@/lib/types';
import { requireAuth } from '@/lib/auth-helpers';

export async function createLogServer(data: Log) {
  await requireAuth(); // Ensure user is authenticated
  const result = await logService.createLog(data);
  revalidatePath('/dashboard');
  return result;
}

export async function updateLogServer(log: Log) {
  await requireAuth(); // Ensure user is authenticated
  await logService.updateLog(log);
  revalidatePath('/dashboard');
}
