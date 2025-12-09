"use client";

import React, { useState, useEffect, Suspense } from 'react';
import type { Tree, Log } from "@/lib/types";
import { useSearchParams, useRouter } from 'next/navigation';

// Context
import { useOrchard } from "@/components/providers/orchard-provider";

// Views & Forms
import { DashboardView } from '@/components/dashboard/views/dashboard-view';
import { TreeDetailView } from '@/components/dashboard/views/tree-detail-view';
import { EmptyDashboardView } from '@/components/dashboard/views/empty-dashboard-view';
import { AddLogForm, type AddLogFormData } from "@/components/forms/add-log-form";
import { BatchActivitiesView } from '@/components/dashboard/views/batch-activities-view';
import { ScheduledActivitiesView } from '@/components/dashboard/views/scheduled-activities-view';
import { DashboardSkeleton } from '@/components/dashboard/skeleton-loader';
import { AddTreeForm } from "@/components/forms/add-tree-form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Types
type ViewState = 'dashboard' | 'add_tree' | 'add_batch_log' | 'tree_detail' | 'batch_activities' | 'scheduled_activities';

function DashboardContent() {
  const { 
    currentOrchardId, 
    currentOrchard, 
    trees, 
    addTree, 
    addLog, 
    addOrchard,
    isLoadingOrchards,
    isLoadingOrchardData
  } = useOrchard();
  const searchParams = useSearchParams();
  const router = useRouter();

  // --- State ---
  const [view, setView] = useState<ViewState>('dashboard');
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const [loadingTreeId, setLoadingTreeId] = useState<string | null>(null);
  const [isAddingTree, setIsAddingTree] = useState(false);
  const [isAddingBatchLog, setIsAddingBatchLog] = useState(false);
  const [activeTab, setActiveTab] = useState<'trees' | 'batch_activities' | 'scheduled_activities'>('trees');

  const selectedTree = trees.find(t => t.id === selectedTreeId);

  // --- Deep Linking ---
  useEffect(() => {
    const treeId = searchParams.get('treeId');
    if (treeId && trees.length > 0) {
      if (trees.some(t => t.id === treeId)) {
        setSelectedTreeId(treeId);
        setView('tree_detail');
        setLoadingTreeId(null); // Clear loading state when view is shown
      }
    } else if (!treeId && view === 'tree_detail') {
      // If no treeId in URL but view is tree_detail, go back to dashboard
      setView('dashboard');
      setSelectedTreeId(null);
      setLoadingTreeId(null);
    }
  }, [searchParams, trees, view]);


  // --- Actions ---

  const handleIdentifyTree = (treeId: string) => {
    setLoadingTreeId(treeId);
    router.replace(`/dashboard?treeId=${treeId}`, { scroll: false });
  };

  const handleBackToDashboard = () => {
    // Clear state immediately to prevent race conditions and dead clicks
    setView('dashboard');
    setSelectedTreeId(null);
    setLoadingTreeId(null);

    // Then update URL
    router.replace('/dashboard', { scroll: false });
  };

  const handleCreateFirstOrchard = () => {
       const name = prompt("ตั้งชื่อสวนของคุณ (เช่น สวนทุเรียนจันทบุรี)");
       if (name) {
           addOrchard(name);
       }
  };

  const handleAddTree = async (data: Partial<Tree>) => {
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

    setIsAddingTree(true);
    try {
      await addTree(newTree);
      setView('dashboard');
    } catch (error) {
      console.error('Failed to add tree:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsAddingTree(false);
    }
  };

  const handleAddBatchLog = async (data: AddLogFormData) => {
     setIsAddingBatchLog(true);
     try {
        await addLog({
           id: Date.now(),
           orchardId: currentOrchardId,
           date: data.date || new Date().toISOString().split('T')[0],
           action: data.action || '',
           note: data.note || '',
           status: data.followUpDate ? 'in-progress' : 'completed',
           followUpDate: data.followUpDate,
           type: 'batch',
           zone: data.targetZone,
        } as Log);

        setView('dashboard');
        setActiveTab('trees');
     } catch (error) {
        console.error('Failed to add batch log:', error);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
     } finally {
        setIsAddingBatchLog(false);
     }
  };

  const handleTabChange = (tab: 'trees' | 'batch_activities' | 'scheduled_activities') => {
    setActiveTab(tab);
    if (tab === 'batch_activities') {
      setView('batch_activities');
    } else if (tab === 'scheduled_activities') {
      setView('scheduled_activities');
    } else {
      setView('dashboard');
    }
  };

  
  // --- Loading State ---
  if (isLoadingOrchards || isLoadingOrchardData) {
      return <DashboardSkeleton />;
  }

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
        isLoading={isAddingTree}
      />
    );
  } else if (view === 'tree_detail' && selectedTree) {
      viewContent = (
          <TreeDetailView
              tree={selectedTree}
              onBack={handleBackToDashboard}
          />
      );
  } else if (view === 'add_batch_log') {
      viewContent = (
        <div className="min-h-screen bg-gray-50 p-4 pb-24 md:pb-8 max-w-md mx-auto">
          <AddLogForm
            isBatch={true}
            zones={currentOrchard.zones}
            onCancel={() => {
              setView('batch_activities');
              setActiveTab('batch_activities');
            }}
            onSubmit={handleAddBatchLog}
            isLoading={isAddingBatchLog}
          />
        </div>
      );
  } else {
     // Default Dashboard View with Tabs
     viewContent = (
        <Tabs>
          <TabsList>
            <TabsTrigger
              isActive={activeTab === 'trees'}
              onClick={() => handleTabChange('trees')}
            >
              ต้นไม้
            </TabsTrigger>
            <TabsTrigger
              isActive={activeTab === 'batch_activities'}
              onClick={() => handleTabChange('batch_activities')}
            >
              งานทั้งแปลง
            </TabsTrigger>
            <TabsTrigger
              isActive={activeTab === 'scheduled_activities'}
              onClick={() => handleTabChange('scheduled_activities')}
            >
              งานที่ต้องทำ
            </TabsTrigger>
          </TabsList>

          <TabsContent>
            {activeTab === 'trees' && (
              <DashboardView
                onViewChange={setView}
                onIdentifyTree={handleIdentifyTree}
                loadingTreeId={loadingTreeId}
                isAddingNewTree={isAddingTree}
              />
            )}
            {activeTab === 'batch_activities' && (
              <BatchActivitiesView
                onAddBatchLog={() => setView('add_batch_log')}
              />
            )}
            {activeTab === 'scheduled_activities' && <ScheduledActivitiesView />}
          </TabsContent>
        </Tabs>
     );
  }
  
  // Consistency Wrapper
  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24 md:pb-8 max-w-md mx-auto space-y-4">
        {viewContent}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
