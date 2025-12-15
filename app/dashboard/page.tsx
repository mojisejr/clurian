"use client";

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import type { Tree } from "@/lib/types";
import { useSearchParams, useRouter } from 'next/navigation';

// Context
import { useOrchard } from "@/components/providers/orchard-provider";
// React Query
import { useOrchardTrees } from "@/lib/hooks/use-orchard-queries";

// Views & Forms
import { DashboardView } from '@/components/dashboard/views/dashboard-view';
import { TreeDetailView } from '@/components/dashboard/views/tree-detail-view';
import { EmptyDashboardView } from '@/components/dashboard/views/empty-dashboard-view';
import { AddLogForm, type AddLogFormData } from "@/components/forms/add-log-form";
import { BatchActivitiesView } from '@/components/dashboard/views/batch-activities-view';
import { ScheduledActivitiesView } from '@/components/dashboard/views/scheduled-activities-view';
import { DashboardSkeleton } from '@/components/dashboard/skeleton-loader';
import { AddTreeForm } from "@/components/forms/add-tree-form";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SlidableTabs } from "@/components/ui/slidable-tabs";
import { useMixingFormulas } from '@/hooks/useMixingFormulas';
import { OrchardSwitchingOverlay } from '@/components/ui/orchard-switching-overlay';

// Types
type ViewState = 'dashboard' | 'add_tree' | 'add_batch_log' | 'tree_detail' | 'batch_activities' | 'scheduled_activities' | 'mixing';

function DashboardContent() {
  const {
    currentOrchardId,
    currentOrchard,
    addTree,
    addLog,
    addOrchard,
    isLoadingOrchards,
    isFetchingOrchardData,
    batchActivityCount,
    scheduledActivityCount,
    filterZone,
    filterStatus,
    searchTerm,
    currentPage
  } = useOrchard();

  // Fetch trees using React Query
  const { data: treesData, isLoading: isLoadingTrees } = useOrchardTrees(currentOrchardId, {
    page: currentPage,
    limit: 1000,
    filters: {
      status: filterStatus !== 'ALL' ? filterStatus : undefined,
      zone: filterZone !== 'ALL' ? filterZone : undefined,
      searchTerm: searchTerm || undefined
    }
  });
  const trees = useMemo(() => treesData?.trees || [], [treesData?.trees]);

  const searchParams = useSearchParams();
  const router = useRouter();

  // --- State ---
  const [view, setView] = useState<ViewState>('dashboard');
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const [loadingTreeId, setLoadingTreeId] = useState<string | null>(null);
  const [isAddingTree, setIsAddingTree] = useState(false);
  const [isAddingBatchLog, setIsAddingBatchLog] = useState(false);
  const [activeTab, setActiveTab] = useState<'trees' | 'batch_activities' | 'scheduled_activities' | 'mixing'>('trees');

  // Load mixing formulas when viewing batch log form
  const { mixingFormulas, isLoading: isLoadingFormulas } = useMixingFormulas({
    enabled: view === 'add_batch_log',
    orchardId: currentOrchardId
  });

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
           id: `temp-${Date.now()}`,
           orchardId: currentOrchardId,
           logType: 'BATCH',
           treeId: undefined,
           targetZone: data.targetZone,
           action: data.action || '',
           note: data.note || '',
           performDate: data.date || new Date().toISOString().split('T')[0],
           status: data.followUpDate ? 'IN_PROGRESS' : 'COMPLETED',
           followUpDate: data.followUpDate,
           createdAt: new Date().toISOString(),
        });

        setView('dashboard');
        setActiveTab('trees');
     } catch (error) {
        console.error('Failed to add batch log:', error);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
     } finally {
        setIsAddingBatchLog(false);
     }
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'trees' || tab === 'batch_activities' || tab === 'scheduled_activities' || tab === 'mixing') {
      setActiveTab(tab as 'trees' | 'batch_activities' | 'scheduled_activities' | 'mixing');
      if (tab === 'batch_activities') {
        setView('batch_activities');
      } else if (tab === 'scheduled_activities') {
        setView('scheduled_activities');
      } else if (tab === 'mixing') {
        setView('mixing');
      } else {
        setView('dashboard');
      }
    }
  };

  
  // --- Loading State ---
  if (isLoadingOrchards || isLoadingTrees) {
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
            mixingFormulas={mixingFormulas}
            isLoadingFormulas={isLoadingFormulas}
          />
        </div>
      );
  } else if (view === 'mixing') {
      // Redirect to mixing page or render mixing component inline
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard/mixing';
      }
      viewContent = (
        <div className="min-h-screen bg-gray-50 p-4 pb-24 md:pb-8 max-w-md mx-auto">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">กำลังไปที่หน้าผสมสารเคมี...</h3>
            <p className="text-gray-600">กรุณารอสักครู่</p>
          </div>
        </div>
      );
  } else {
     // Default Dashboard View with Slidable Tabs
     viewContent = (
        <Tabs>
          <SlidableTabs
            tabs={[
              {
                id: 'trees',
                label: 'ต้นไม้',
                badge: undefined
              },
              {
                id: 'batch_activities',
                label: 'งานทั้งแปลง',
                badge: batchActivityCount > 0 ? batchActivityCount : undefined
              },
              {
                id: 'scheduled_activities',
                label: 'งานที่ต้องทำ',
                badge: scheduledActivityCount > 0 ? scheduledActivityCount : undefined
              },
              {
                id: 'mixing',
                label: 'ผสมสารเคมี',
                badge: undefined
              }
            ]}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

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
            {activeTab === 'mixing' && (
              <div className="space-y-4">
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">กำลังโหลดหน้าผสมสารเคมี...</h3>
                  <p className="text-gray-600">หากคุณรอนานกว่านี้ กรุณา</p>
                  <Button
                    className="mt-4"
                    onClick={() => window.location.href = '/dashboard/mixing'}
                  >
                    ไปที่หน้าผสมสารเคมี
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
     );
  }
  
  // Consistency Wrapper
  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 pb-24 md:pb-8 max-w-md mx-auto space-y-4">
        {viewContent}
      </div>
      <OrchardSwitchingOverlay
        isVisible={isFetchingOrchardData && !isLoadingOrchards}
        orchardName={currentOrchard?.name}
      />
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
