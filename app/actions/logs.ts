'use server';

import { revalidatePath } from 'next/cache';
import * as logService from '@/lib/services/log-service';
import { Log } from '@/lib/types';
import { requireAuth } from '@/lib/auth-helpers';

export async function createLogServer(data: Log) {
  await requireAuth(); // Ensure user is authenticated
  const result = await logService.createLog(data);

  // Invalidate the dashboard page
  revalidatePath('/dashboard');

  // TODO: Implement revalidateTag when properly configured
  // revalidateTag(`orchard-${data.orchardId}`);
  // revalidateTag(`logs-${data.orchardId}`);

  return result;
}

export async function updateLogServer(log: Log) {
  await requireAuth(); // Ensure user is authenticated
  await logService.updateLog(log);

  // Invalidate the dashboard page
  revalidatePath('/dashboard');

  // TODO: Implement revalidateTag when properly configured
  // revalidateTag(`orchard-${log.orchardId}`);
  // revalidateTag(`logs-${log.orchardId}`);

  return log;
}
