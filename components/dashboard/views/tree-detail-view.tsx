"use client";

import React, { useState } from 'react';
import type { Tree, Log } from "@/lib/types";
import { useOrchard } from "@/components/providers/orchard-provider";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import { LogDetailModal } from "@/components/modals/log-detail-modal";
import { FollowUpModal } from "@/components/modals/follow-up-modal";
import { AddLogForm } from "@/components/forms/add-log-form";
import { TreeProfileCard } from '@/components/dashboard/detail/tree-profile-card';
import { TreeHistorySection } from '@/components/dashboard/detail/tree-history-section';

interface TreeDetailViewProps {
  tree: Tree;
  onBack: () => void;
}

export function TreeDetailView({ tree, onBack }: TreeDetailViewProps) {
  const { logs, currentOrchardId, updateTree, addTree, addLog, updateLogs } = useOrchard();
  
  // Local State
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [viewLog, setViewLog] = useState<Log | null>(null);
  const [followUpLog, setFollowUpLog] = useState<Log | null>(null);

  // --- Actions ---

  const handleReplant = async () => {
     if (!confirm(`ต้องการ "ปลูกซ่อม" ในตำแหน่ง ${tree.code} ใช่หรือไม่?`)) return;

     const oldTree = tree;
     const newTree: Tree = {
         ...oldTree,
         id: `uuid-${Date.now()}`,
         status: 'healthy',
         plantedDate: new Date().toISOString().split('T')[0]
     };

     await updateTree(oldTree.id, { status: 'archived', code: `${oldTree.code}_HIST_${Date.now()}` });
     const savedTree = await addTree(newTree);
     
     if (savedTree) {
        addLog({
            id: Date.now(),
            orchardId: currentOrchardId,
            type: 'individual',
            treeId: savedTree.id,
            date: new Date().toISOString().split('T')[0],
            action: 'ปลูกซ่อม (Replant)',
            note: `ปลูกแทนต้นเดิม (Ref: ${oldTree.id})`,
            status: 'completed'
        } as Log);
        
        onBack(); 
     }
  };

  const handleFollowUpSubmit = (result: { type: 'cured' | 'continue', note: string, nextDate?: string }) => {
    if (!followUpLog) return;
    const today = new Date().toISOString().split('T')[0];
    const updatedAllLogs = logs.map(l => l.id === followUpLog.id ? { ...l, status: 'completed' as const } : l);

    if (result.type === 'cured') {
        const cureLog: Log = {
            id: Date.now(),
            orchardId: currentOrchardId,
            type: 'individual',
            treeId: followUpLog.treeId,
            date: today,
            action: `ติดตามอาการ: ${followUpLog.action}`,
            note: `[จบเคส] อาการดีขึ้น/หายแล้ว - ${result.note}`,
            status: 'completed'
        } as Log;
        
        if (followUpLog.treeId) updateTree(followUpLog.treeId, { status: 'healthy' });
        updateLogs([cureLog, ...updatedAllLogs]);
    } else {
        const continueLog: Log = {
            id: Date.now(),
            orchardId: currentOrchardId,
            type: 'individual',
            treeId: followUpLog.treeId,
            date: today,
            action: `รักษาต่อเนื่อง: ${followUpLog.action}`,
            note: `[ยังไม่หาย] ${result.note}`,
            status: 'in-progress',
            followUpDate: result.nextDate
        } as Log;
        updateLogs([continueLog, ...updatedAllLogs]);
    }
    setFollowUpLog(null);
  };

  interface LogSubmissionData {
    action: string;
    note: string;
    date: string;
    followUpDate?: string;
  }

  const handleAddLogSubmit = async (data: LogSubmissionData) => {
    try {
      await addLog({
          ...data,
          id: Date.now(),
          status: data.followUpDate ? 'in-progress' : 'completed',
          type: 'individual',
          treeId: tree.id,
          orchardId: currentOrchardId
      } as Log);
      setIsAddingLog(false);
    } catch (error) {
      console.error('Failed to add log:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    }
  };

  // --- Render ---

  // If Adding Log, render the form directly (mimic page navigation)
  if (isAddingLog) {
      return (
          <AddLogForm
              className="mt-0 shadow-none border-0" // Reset card styling to fit seamlessly
              onCancel={() => setIsAddingLog(false)}
              onSubmit={handleAddLogSubmit}
              zones={[]}
              isBatch={false}
              treeCode={tree.code}
              isLoading={true}
          />
      );
  }

  // Normal Tree Detail View
  return (
      <div className="space-y-4">
          {/* Back Button */}
          <Button variant="ghost" className="pl-0 gap-2 hover:bg-transparent hover:text-primary transition-colors" onClick={onBack}>
              <ArrowLeft size={18} /> กลับหน้าหลัก
          </Button>

          <TreeProfileCard 
              tree={tree}
              onAddLog={() => setIsAddingLog(true)}
              onReplant={handleReplant}
          />

          <TreeHistorySection 
              tree={tree} 
              onLogClick={setViewLog}
          />

          {/* Log Detail Modal */}
          {viewLog && (
              <LogDetailModal 
                  log={viewLog} 
                  open={!!viewLog} 
                  onClose={() => setViewLog(null)}
                  onFollowUp={() => {
                      setFollowUpLog(viewLog);
                      setViewLog(null);
                  }}
              />
          )}

          {/* Follow Up Modal */}
          {followUpLog && (
              <FollowUpModal
                  open={!!followUpLog}
                  onClose={() => setFollowUpLog(null)}
                  log={followUpLog}
                  onSubmit={handleFollowUpSubmit}
              />
          )}
      </div>
  );
}
