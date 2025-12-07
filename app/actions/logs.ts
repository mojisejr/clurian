'use server';

import { revalidatePath } from 'next/cache';
import * as logService from '@/lib/services/log-service';
import { Log } from '@/lib/types';

export async function createLogServer(data: Log) {
  const result = await logService.createLog(data);
  revalidatePath('/dashboard');
  return result;
}

export async function updateLogServer(log: Log) {
  await logService.updateLog(log);
  revalidatePath('/dashboard');
}
