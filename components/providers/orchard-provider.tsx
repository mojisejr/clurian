"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Orchard, Tree, Log } from "@/lib/types";
import { 
    getOrchards, 
    createOrchard, 
    getOrchardData, 
    createTreeServer, 
    createLogServer, 
    updateTreeStatusServer,
    archiveTreeServer,
    updateLogServer
} from "@/app/actions/orchard";

interface OrchardContextType {
  orchards: Orchard[];
  isLoadingOrchards: boolean;
  currentOrchardId: string;
  currentOrchard: Orchard;
  setCurrentOrchardId: (id: string) => void;
  addOrchard: (name: string) => void;
  
  trees: Tree[];
  isLoadingOrchardData: boolean;
  setTrees: React.Dispatch<React.SetStateAction<Tree[]>>;
  addTree: (tree: Tree) => Promise<Tree | null>;
  updateTree: (treeId: string, updates: Partial<Tree>) => Promise<void>;
  
  logs: Log[];
  setLogs: React.Dispatch<React.SetStateAction<Log[]>>;
  addLog: (log: Log) => void;
  updateLogs: (logs: Log[]) => void;
}

const OrchardContext = createContext<OrchardContextType | undefined>(undefined);

export function OrchardProvider({ children }: { children: React.ReactNode }) {
  const [orchards, setOrchards] = useState<Orchard[]>([]);
  const [isLoadingOrchards, setIsLoadingOrchards] = useState(true);
  const [currentOrchardId, setCurrentOrchardId] = useState<string>("");
  // We'll assume the first orchard is default for now, or handle empty properly
  const [trees, setTrees] = useState<Tree[]>([]);
  const [isLoadingOrchardData, setIsLoadingOrchardData] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);

  const currentOrchard = orchards.find((o) => o.id === currentOrchardId) || orchards[0];

  // 1. Initial Load: Get Orchards
  useEffect(() => {
      const initInfo = async () => {
          setIsLoadingOrchards(true);
          try {
            const fetchedOrchards = await getOrchards();
            setOrchards(fetchedOrchards);
            if (fetchedOrchards.length > 0) {
                setCurrentOrchardId(fetchedOrchards[0].id);
            }
          } catch (error) {
            console.error("Failed to fetch orchards:", error);
            if (error instanceof Error && error.message.includes("Unauthorized")) {
                // Session might be invalid despite middleware check
                window.location.href = '/login';
            }
          } finally {
            setIsLoadingOrchards(false);
          }
      };
      initInfo();
  }, []);

  // 2. When Orchard Changes, Get Data
  useEffect(() => {
      if (!currentOrchardId) {
          setTrees([]);
          setLogs([]);
          return;
      }
      const fetchData = async () => {
          setIsLoadingOrchardData(true);
          try {
            const { trees, logs } = await getOrchardData(currentOrchardId);
            setTrees(trees);
            setLogs(logs);
          } catch (error) {
            console.error("Failed to fetch orchard data:", error);
            if (error instanceof Error && error.message.includes("Unauthorized")) {
                window.location.href = '/login';
            }
          } finally {
            setIsLoadingOrchardData(false);
          }
      };
      fetchData();
  }, [currentOrchardId]);

  // --- Actions ---

  const handleAddOrchard = async (name: string) => {
      const newOrchard = await createOrchard(name);
      if (newOrchard) {
          setOrchards(prev => [newOrchard, ...prev]);
          setCurrentOrchardId(newOrchard.id);
      }
  };

  const handleAddTree = async (tree: Tree) => {
    // Optimistic or Wait? Let's wait for safety as requested "100% pass"
    const savedTree = await createTreeServer(tree);
    if (savedTree) {
        setTrees(prev => [savedTree, ...prev]);
        
        // Check if we need to update zones locally (refetching orchard list might be safer but heavier)
        if (currentOrchard && !currentOrchard.zones.includes(tree.zone)) {
             setOrchards(prev => prev.map(o => {
                if (o.id === tree.orchardId) return { ...o, zones: [...o.zones, tree.zone].sort() };
                return o;
            }));
        }
    }
    return savedTree;
  };

  const handleUpdateTree = async (treeId: string, updates: Partial<Tree>) => {
    // Optimistic Update
    setTrees(prev => prev.map(t => t.id === treeId ? { ...t, ...updates } : t));

    if (updates.status) {
        if (updates.status === 'archived' && updates.code) {
            await archiveTreeServer(treeId, updates.code);
        } else {
             await updateTreeStatusServer(treeId, updates.status);
        }
    }
    // Note: If other fields update, we'd need more server actions. Currently UI only updates status/archive.
  };

  const handleAddLog = async (log: Log) => {
    const savedLog = await createLogServer(log);
    if (savedLog) {
         setLogs(prev => [savedLog, ...prev]);
    }
  };

  const handleUpdateLogs = async (updatedLogs: Log[]) => {
      // This is a bit tricky. The UI passes the whole new list? 
      // Or usually it updates one items.
      // In TreeDetailView, we were doing: updateLogs([cureLog, ...updatedAllLogs]);
      // Which implies we are mixing NEW logs (cureLog) and UPDATED logs (original with status completed).
      
      // Strategy: Identify what's new vs updated by ID type (number vs string)
      // BUT `id` in Log type is `number | string`.
      // Let's assume the caller uses `addLog` for new ones.
      
      // Actually `TreeDetailView` separates them? No, it bundles them.
      // Let's implement a smarter loop here.
      
      setLogs(updatedLogs); // Optimistic UI update

      for (const log of updatedLogs) {
          // If it's a new log (we can tell if we track 'new' vs 'existing' but here we just have the list)
          // Simple heuristic: If we don't have it in old DB list (fetched logs)? 
          // BETTER: The UI should call `addLog` for new ones and `updateLog` for old ones.
          // Refactoring `TreeDetailView` logic might be needed, strictly speaking.
          
          // However, for PASSING requirements now:
          // We iterate and try to update. If ID is numeric (Date.now()), it's new? 
          // DB IDs are UUIDs (strings). So numeric ID = NEW.
          
          if (typeof log.id === 'number') {
             // It's likely a new log created in UI with Date.now()
             await createLogServer(log);
          } else {
             // It's likely an existing log
             await updateLogServer(log);
          }
      }
      
      // Refresh to get real IDs
      if (currentOrchardId) {
           const { logs: freshLogs } = await getOrchardData(currentOrchardId);
           setLogs(freshLogs);
      }
  };

  return (
    <OrchardContext.Provider
      value={{
        orchards,
        isLoadingOrchards,
        currentOrchardId,
        currentOrchard,
        setCurrentOrchardId,
        addOrchard: handleAddOrchard,
        trees,
        isLoadingOrchardData,
        setTrees,
        addTree: handleAddTree,
        updateTree: handleUpdateTree,
        logs,
        setLogs,
        addLog: handleAddLog,
        updateLogs: handleUpdateLogs
      }}
    >
      {children}
    </OrchardContext.Provider>
  );
}

export function useOrchard() {
  const context = useContext(OrchardContext);
  if (context === undefined) {
    throw new Error("useOrchard must be used within an OrchardProvider");
  }
  return context;
}
