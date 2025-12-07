"use client";

import React, { useState, useEffect } from 'react';
import type { Tree, Log } from "@/lib/types";
import { useSearchParams } from 'next/navigation';

// Context
import { useOrchard } from "@/components/providers/orchard-provider";

// Views & Forms
import { DashboardView } from '@/components/dashboard/views/dashboard-view';
import { TreeDetailView } from '@/components/dashboard/views/tree-detail-view';
import { EmptyDashboardView } from '@/components/dashboard/views/empty-dashboard-view';
import { AddTreeForm } from "@/components/forms/add-tree-form";
import { AddLogForm } from "@/components/forms/add-log-form";

// Types
type ViewState = 'dashboard' | 'add_tree' | 'add_batch_log' | 'tree_detail';

export default function DashboardPage() {
  const { currentOrchardId, currentOrchard, trees, addTree, addLog, addOrchard } = useOrchard();
  const searchParams = useSearchParams();

  // --- State ---
  const [view, setView] = useState<ViewState>('dashboard');
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);

  const selectedTree = trees.find(t => t.id === selectedTreeId);

  // --- Deep Linking ---
  useEffect(() => {
    const treeId = searchParams.get('treeId');
    if (treeId && trees.length > 0) {
      if (trees.some(t => t.id === treeId)) {
        setSelectedTreeId(treeId);
        setView('tree_detail');
      }
    }
  }, [searchParams, trees]);


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
      return <EmptyDashboardView onCreateOrchard={handleCreateFirstOrchard} />;
  }

  // --- Render Views ---
  let viewContent;

  if (view === 'add_tree') {
     viewContent = (
      <AddTreeForm 
        onCancel={() => setView('dashboard')}
        onSubmit={handleAddTree}
        zones={currentOrchard.zones}
      />
    );
  } else if (view === 'add_batch_log') {
    viewContent = (
        <AddLogForm
            onCancel={() => setView('dashboard')}
            onSubmit={handleAddBatchLog}
            zones={currentOrchard.zones}
            isBatch={true}
        />
    );
  } else if (view === 'tree_detail' && selectedTree) {
      viewContent = (
          <TreeDetailView 
              tree={selectedTree} 
              onBack={() => setView('dashboard')} 
          />
      );
  } else {
     // Default Dashboard View
     viewContent = (
        <DashboardView 
            onViewChange={setView}
            onIdentifyTree={handleIdentifyTree}
        />
     );
  }
  
  // Consistency Wrapper
  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24 md:pb-8 max-w-md mx-auto space-y-4">
        {viewContent}
    </div>
  );
}
