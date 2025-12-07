'use server';

import { prisma } from '@/src/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { Orchard, Tree, Log, TreeStatus, LogStatus, LogType } from '@/lib/types';

// Map Prisma enums to UI types
const mapTreeStatus = (status: string): TreeStatus => {
  return status.toLowerCase() as TreeStatus;
};

const mapLogStatus = (status: string): LogStatus => {
  return (status === 'IN_PROGRESS' ? 'in-progress' : 'completed');
};

const mapLogType = (type: string): LogType => {
  return type.toLowerCase() as LogType;
};

// Hardcoded user ID for now as requested (assuming single user context/MVP)
// In a real app, we would get this from auth()
const DEMO_USER_ID = "cm458x2z30000356sl1234567"; 

// --- Orchard Actions ---

export async function getOrchards(): Promise<Orchard[]> {
  try {
      // Ensure demo user exists
      let user = await prisma.user.findUnique({ where: { id: DEMO_USER_ID } });
      if (!user) {
          user = await prisma.user.create({
              data: {
                  id: DEMO_USER_ID,
                  name: "Demo User",
                  email: "demo@clurian.com"
              }
          });
      }

      const orchards = await prisma.orchard.findMany({
          where: { ownerId: DEMO_USER_ID },
          orderBy: { createdAt: 'desc' }
      });

      return orchards.map(o => ({
          id: o.id,
          name: o.name,
          zones: o.zones as string[]
      }));
  } catch (error) {
      console.error("Failed to get orchards:", error);
      return [];
  }
}

export async function createOrchard(name: string): Promise<Orchard | null> {
  try {
      const orchard = await prisma.orchard.create({
          data: {
              name,
              ownerId: DEMO_USER_ID,
              zones: ["A"] // Default zone
          }
      });
      revalidatePath('/dashboard');
      return {
          id: orchard.id,
          name: orchard.name,
          zones: orchard.zones as string[]
      };
  } catch (error) {
      console.error("Failed to create orchard:", error);
      return null;
  }
}

// --- Data Fetching Actions ---

export async function getOrchardData(orchardId: string) {
  try {
      const trees = await prisma.tree.findMany({
          where: { orchardId },
          orderBy: { createdAt: 'desc' }
      });

      const logs = await prisma.activityLog.findMany({
          where: { orchardId },
          orderBy: { performDate: 'desc' }
      });

      return {
          trees: trees.map(t => ({
              id: t.id,
              orchardId: t.orchardId,
              code: t.code,
              zone: t.zone,
              type: t.type,
              variety: t.variety,
              plantedDate: t.plantedDate ? t.plantedDate.toISOString().split('T')[0] : '',
              status: mapTreeStatus(t.status)
          }) as Tree),
          logs: logs.map(l => ({
              id: l.id,
              orchardId: l.orchardId,
              type: mapLogType(l.logType),
              zone: l.targetZone || undefined,
              treeId: l.treeId || undefined,
              action: l.action,
              date: l.performDate.toISOString().split('T')[0],
              note: l.note || '',
              status: mapLogStatus(l.status),
              followUpDate: l.followUpDate ? l.followUpDate.toISOString().split('T')[0] : undefined
          }) as Log)
      };
  } catch (error) {
      console.error("Failed to get orchard data:", error);
      return { trees: [], logs: [] };
  }
}

// --- Tree Actions ---

export async function createTreeServer(data: Tree): Promise<Tree | null> {
  try {
      // Check if orchard needs zone update
      const orchard = await prisma.orchard.findUnique({ where: { id: data.orchardId } });
      if (orchard) {
          const currentZones = orchard.zones as string[];
          if (!currentZones.includes(data.zone)) {
              await prisma.orchard.update({
                  where: { id: data.orchardId },
                  data: { zones: [...currentZones, data.zone].sort() }
              });
          }
      }

      const tree = await prisma.tree.create({
          data: {
              orchardId: data.orchardId,
              code: data.code,
              zone: data.zone,
              type: data.type,
              variety: data.variety,
              plantedDate: new Date(data.plantedDate),
              status: data.status.toUpperCase() as any
          }
      });
      revalidatePath('/dashboard');
      return {
          ...data,
          id: tree.id
      };
  } catch (error) {
      console.error("Failed to create tree:", error);
      return null;
  }
}

export async function updateTreeStatusServer(treeId: string, status: TreeStatus) {
    try {
        await prisma.tree.update({
            where: { id: treeId },
            data: { status: status.toUpperCase() as any }
        });
        revalidatePath('/dashboard');
    } catch (error) {
        console.error("Failed to update tree:", error);
    }
}

export async function archiveTreeServer(treeId: string, newCode: string) {
    try {
        await prisma.tree.update({
            where: { id: treeId },
            data: { 
                status: 'ARCHIVED',
                code: newCode 
            }
        });
        revalidatePath('/dashboard');
    } catch (error) {
        console.error("Failed to archive tree:", error);
    }
}


// --- Log Actions ---

export async function createLogServer(data: Log): Promise<Log | null> {
    try {
        const log = await prisma.activityLog.create({
            data: {
                orchardId: data.orchardId,
                logType: data.type.toUpperCase() as any,
                treeId: data.treeId,
                targetZone: data.zone,
                action: data.action,
                note: data.note,
                performDate: new Date(data.date),
                status: (data.status === 'in-progress' ? 'IN_PROGRESS' : 'COMPLETED'),
                followUpDate: data.followUpDate ? new Date(data.followUpDate) : null
            }
        });
        revalidatePath('/dashboard');
        return {
            ...data,
            id: log.id
        };
    } catch (error) {
        console.error("Failed to create log:", error);
        return null;
    }
}

export async function updateLogServer(log: Log) {
    // For now we assume this is mostly for completing logs or updating notes
    try {
        await prisma.activityLog.update({
            where: { id: String(log.id) },
            data: {
                status: (log.status === 'in-progress' ? 'IN_PROGRESS' : 'COMPLETED'),
                note: log.note,
                // Add other fields as needed
            }
        });
        revalidatePath('/dashboard');
    } catch (error) {
        console.error("Failed to update log:", error);
    }
}
