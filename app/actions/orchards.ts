'use server';

import { revalidatePath } from 'next/cache';
import * as orchardService from '@/lib/services/orchard-service';
import * as treeService from '@/lib/services/tree-service';
import * as activityService from '@/lib/services/activity-service';
import * as dashboardService from '@/lib/services/dashboard-service';
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

export async function getOrchardTreesServer(
  orchardId: string,
  page: number = 1,
  limit: number = 20,
  filters?: {
    status?: string;
    zone?: string;
    searchTerm?: string;
  }
) {
  await requireAuth();
  return treeService.getOrchardTrees(orchardId, page, limit, {
    status: filters?.status?.toUpperCase() as 'HEALTHY' | 'SICK' | 'DEAD' | 'ARCHIVED',
    zone: filters?.zone,
    searchTerm: filters?.searchTerm
  });
}

export async function getOrchardActivityLogsServer(
  orchardId: string,
  page: number = 1,
  limit: number = 20,
  filters?: {
    logType?: string;
    zone?: string;
    dateFrom?: string;
    dateTo?: string;
  }
) {
  await requireAuth();
  return activityService.getOrchardActivityLogs(orchardId, page, limit, {
    logType: filters?.logType?.toUpperCase() as 'INDIVIDUAL' | 'BATCH',
    zone: filters?.zone,
    dateFrom: filters?.dateFrom,
    dateTo: filters?.dateTo
  });
}

export async function getDashboardDataServer(orchardId: string, userId: string) {
  await requireAuth();
  return dashboardService.getDashboardData(orchardId, userId);
}
