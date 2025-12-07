"use client";

import React, { useState } from 'react';
import type { Tree, Log, TreeStatus } from "@/lib/types";
import { useOrchard } from "@/components/providers/orchard-provider";
import { Button } from "@/components/ui/button";
import { LogDetailModal } from "@/components/modals/log-detail-modal";
import { FollowUpModal } from "@/components/modals/follow-up-modal";
import { AddLogForm } from "@/components/forms/add-log-form";

interface TreeDetailViewProps {
  tree: Tree;
  onBack: () => void;
}

export function TreeDetailView({ tree, onBack }: TreeDetailViewProps) {
  const { logs, currentOrchardId, updateTree, addTree, addLog, updateLogs } = useOrchard();
  
  const [viewLog, setViewLog] = useState<Log | null>(null);
  const [followUpLog, setFollowUpLog] = useState<Log | null>(null);

  // Filter logs for this tree (and batch logs for its zone)
  const treeHistory = logs.filter(l => 
      (l.type === 'individual' && l.treeId === tree.id) ||
      (l.type === 'batch' && l.zone === tree.zone && l.orchardId === currentOrchardId)
  ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleChangeStatus = (newStatus: TreeStatus) => {
      updateTree(tree.id, { status: newStatus });
      
      const statusLabels: Record<string, string> = { healthy: 'ปกติ', sick: 'ป่วย', dead: 'ตาย' };
      
      addLog({
          id: Date.now(),
          orchardId: currentOrchardId,
          type: 'individual',
          treeId: tree.id,
          date: new Date().toISOString().split('T')[0],
          action: `อัพเดทสถานะ: ${statusLabels[newStatus] || newStatus}`,
          note: 'ปรับปรุงสถานะผ่านหน้าข้อมูลต้นไม้',
          status: 'completed'
      } as Log);
  };

  const handleReplant = () => {
     if (!confirm(`ต้องการ "ปลูกซ่อม" ในตำแหน่ง ${tree.code} ใช่หรือไม่?`)) return;

     const oldTree = tree;
     const newTree: Tree = {
         ...oldTree,
         id: `uuid-${Date.now()}`,
         status: 'healthy',
         plantedDate: new Date().toISOString().split('T')[0]
     };

     // Archive old tree
     updateTree(oldTree.id, { status: 'archived', code: `${oldTree.code}_HIST` });
     
     // Add new tree
     addTree(newTree);
     
     // TODO: Ideally we should switch view to new tree, but onBack triggers navigation logic in parent. 
     // We might need a callback onSwitchTree(newId). For now let's just add log.
     
     addLog({
         id: Date.now(),
         orchardId: currentOrchardId,
         type: 'individual',
         treeId: newTree.id,
         date: new Date().toISOString().split('T')[0],
         action: 'ปลูกซ่อม (Replant)',
         note: `ปลูกแทนต้นเดิม (Ref: ${oldTree.id})`,
         status: 'completed'
     } as Log);
     
     onBack(); // Go back to list to see new tree
  };

  const handleFollowUpSubmit = (result: { type: 'cured' | 'continue', note: string, nextDate?: string }) => {
    if (!followUpLog) return;

    const today = new Date().toISOString().split('T')[0];
    const newLogs: Log[] = [];

    // Mark original as completed
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
        
        // Change tree status to healthy
        if (followUpLog.treeId) {
             updateTree(followUpLog.treeId, { status: 'healthy' });
        }
        
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

  return (
      <div className="space-y-4">
          <Button variant="ghost" className="pl-0 gap-2" onClick={onBack}>
              &larr; กลับหน้าหลัก
          </Button>
          
          <div className="bg-white p-4 rounded-xl border shadow-sm flex justify-between items-start">
              <div>
                  <div className="text-3xl font-bold">{tree.code}</div>
                  <div className="text-gray-500">{tree.type} • {tree.variety}</div>
              </div>
              <div className="text-right">
                   <span className={`px-2 py-1 text-xs rounded-full border ${tree.status === 'healthy' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                       {tree.status === 'healthy' ? 'ปกติ' : 'ป่วย/ตาย'}
                   </span>
              </div>
          </div>

           <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full" onClick={() => handleChangeStatus('healthy')}>สลับสถานะ</Button>
              <Button variant="destructive" className="w-full" onClick={handleReplant}>ปลูกซ่อม</Button>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-4">
              <h3 className="font-bold mb-3">ประวัติการดูแล</h3>
               <div className="space-y-3">
                  {treeHistory.map(log => (
                      <div key={log.id} 
                           className="border-b pb-2 last:border-0 cursor-pointer hover:bg-gray-50"
                           onClick={() => setViewLog(log)}
                      >
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>{log.date}</span>
                              <span>{log.status === 'in-progress' ? 'รอติดตาม' : 'เสร็จสิ้น'}</span>
                          </div>
                          <div className="font-medium">{log.action}</div>
                          <div className="text-xs text-gray-400 truncate">{log.note}</div>
                      </div>
                  ))}
               </div>
               <Button className="w-full mt-4" onClick={() => setViewLog({ id: 0, orchardId: currentOrchardId, type: 'individual', treeId: tree.id, status: 'completed' } as Log)}>
                    + บันทึกกิจกรรม
               </Button>
          </div>

          {/* Modals */}
          {viewLog && viewLog.id !== 0 && (
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

           {/* Add Log Modal (reusing Form component in modal wrapper) */}
           {viewLog && viewLog.id === 0 && (
               <div className="fixed inset-0 bg-white z-50 overflow-auto p-4 animate-in fade-in slide-in-from-bottom-10">
                    <AddLogForm
                        onCancel={() => setViewLog(null)}
                        onSubmit={(data) => {
                            addLog({ 
                                ...data, 
                                id: Date.now(),
                                status: data.followUpDate ? 'in-progress' : 'completed',
                                type: 'individual', 
                                treeId: tree.id,
                                orchardId: currentOrchardId
                            } as Log);
                            setViewLog(null);
                        }}
                        zones={[]}
                        isBatch={false}
                        treeCode={tree.code}
                    />
               </div>
           )}

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
