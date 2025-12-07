"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_ORCHARDS, generateMockTrees, INITIAL_LOGS } from "@/src/lib/mock-data";
import type { Orchard, Tree, Log } from "@/lib/types";

interface OrchardContextType {
  orchards: Orchard[];
  currentOrchardId: string;
  currentOrchard: Orchard;
  setCurrentOrchardId: (id: string) => void;
  addOrchard: (name: string) => void;
  
  trees: Tree[];
  setTrees: React.Dispatch<React.SetStateAction<Tree[]>>;
  addTree: (tree: Tree) => void;
  updateTree: (treeId: string, updates: Partial<Tree>) => void;
  
  logs: Log[];
  setLogs: React.Dispatch<React.SetStateAction<Log[]>>;
  addLog: (log: Log) => void;
  updateLogs: (logs: Log[]) => void; // Batch update or replace
}

const OrchardContext = createContext<OrchardContextType | undefined>(undefined);

export function OrchardProvider({ children }: { children: React.ReactNode }) {
  const [orchards, setOrchards] = useState<Orchard[]>([]);
  const [currentOrchardId, setCurrentOrchardId] = useState<string>("");
  const [trees, setTrees] = useState<Tree[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);

  const currentOrchard = orchards.find((o) => o.id === currentOrchardId) || orchards[0];

  const addOrchard = (name: string) => {
    const newOrchard: Orchard = {
      id: `orchard-${Date.now()}`,
      name,
      zones: ["A"],
    };
    setOrchards([...orchards, newOrchard]);
    setCurrentOrchardId(newOrchard.id);
  };

  const addTree = (tree: Tree) => {
    setTrees(prev => [...prev, tree]);
    
    // Auto-add zone if new
    if (!currentOrchard.zones.includes(tree.zone)) {
        setOrchards(prev => prev.map(o => {
            if (o.id === tree.orchardId) return { ...o, zones: [...o.zones, tree.zone].sort() };
            return o;
        }));
    }
  };

  const updateTree = (treeId: string, updates: Partial<Tree>) => {
    setTrees(prev => prev.map(t => t.id === treeId ? { ...t, ...updates } : t));
  };

  const addLog = (log: Log) => {
    setLogs(prev => [log, ...prev]);
  };

  const updateLogs = (updatedLogs: Log[]) => {
      // This might be replacing all logs or merging. 
      // For the use case in dashboard (updating status of old logs + adding new one), 
      // replacing the whole list is safest if the callee prepares it, 
      // or we can optimize later.
      setLogs(updatedLogs); 
  };

  return (
    <OrchardContext.Provider
      value={{
        orchards,
        currentOrchardId,
        currentOrchard,
        setCurrentOrchardId,
        addOrchard,
        trees,
        setTrees,
        addTree,
        updateTree,
        logs,
        setLogs,
        addLog,
        updateLogs
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
