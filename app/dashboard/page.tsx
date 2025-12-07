"use client";

import React, { useState } from 'react';
import type { Tree, Log } from "@/lib/types";

// Context
import { useOrchard } from "@/components/providers/orchard-provider";

// Views & Forms
import { DashboardView } from '@/components/dashboard/views/dashboard-view';
import { TreeDetailView } from '@/components/dashboard/views/tree-detail-view';
import { AddTreeForm } from "@/components/forms/add-tree-form";
import { AddLogForm } from "@/components/forms/add-log-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sprout, PlusCircle } from "lucide-react";

// Types
type ViewState = 'dashboard' | 'add_tree' | 'add_batch_log' | 'tree_detail';

export default function DashboardPage() {
  const { currentOrchardId, currentOrchard, trees, addTree, addLog, addOrchard } = useOrchard();

  // --- State ---
  const [view, setView] = useState<ViewState>('dashboard');
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);

  const selectedTree = trees.find(t => t.id === selectedTreeId);

  // --- Actions ---

  const handleIdentifyTree = (treeId: string) => {
    setSelectedTreeId(treeId);
    setView('tree_detail');
  };

  const handleCreateFirstOrchard = () => {
       const name = prompt("ตั้งชื่อสวนของคุณ (เช่น สวนทุเรียนจันทบุรี)");
       if (name) {
           addOrchard(name);
       }
  };

  const handleAddTree = (data: Partial<Tree>) => {
    const newTree: Tree = {
      id: `uuid-${Date.now()}`,
      orchardId: currentOrchardId,
      status: 'healthy',
      code: data.code || `N-${Date.now()}`,
      zone: data.zone || 'A',
      type: data.type || 'ทุเรียน',
      variety: data.variety || 'หมอนทอง',
      plantedDate: data.plantedDate || new Date().toISOString().split('T')[0],
      ...data
    } as Tree;

    addTree(newTree);
    setView('dashboard');
  };

  const handleAddBatchLog = (data: Partial<Log>) => {
     addLog({
        id: Date.now(),
        orchardId: currentOrchardId,
        date: data.date || new Date().toISOString().split('T')[0],
        action: data.action || '',
        note: data.note || '',
        status: data.followUpDate ? 'in-progress' : 'completed',
        followUpDate: data.followUpDate,
        type: 'batch',
        zone: data.zone,
     } as Log);
     
     setView('dashboard');
  };

  // --- Empty State ---
  if (!currentOrchard) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
              <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl">
                  <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                      <Sprout size={40} className="text-green-600" />
                  </div>
                  <div>
                      <h2 className="text-2xl font-bold text-gray-800">ยินดีต้อนรับสู่ Clurian</h2>
                      <p className="text-gray-500 mt-2">เริ่มจัดการสวนของคุณได้ง่ายๆ เพียงสร้างสวนแรกของคุณ</p>
                  </div>
                  <Button onClick={handleCreateFirstOrchard} className="w-full h-12 text-lg gap-2 shadow-lg animate-pulse">
                      <PlusCircle size={20} /> สร้างสวนใหม่
                  </Button>
              </Card>
          </div>
      );
  }

  // --- Render Views ---

  if (view === 'add_tree') {
    return (
      <AddTreeForm 
        onCancel={() => setView('dashboard')}
        onSubmit={handleAddTree}
        zones={currentOrchard.zones}
      />
    );
  }

  if (view === 'add_batch_log') {
    return (
        <AddLogForm
            onCancel={() => setView('dashboard')}
            onSubmit={handleAddBatchLog}
            zones={currentOrchard.zones}
            isBatch={true}
        />
    );
  }

  if (view === 'tree_detail' && selectedTree) {
      return (
          <TreeDetailView 
              tree={selectedTree} 
              onBack={() => setView('dashboard')} 
          />
      );
  }

  // Default Dashboard View
  return (
    <div className="min-h-screen  p-4 pb-20 max-w-md mx-auto">
        <DashboardView 
            onViewChange={setView}
            onIdentifyTree={handleIdentifyTree}
        />
    </div>
  );
}
