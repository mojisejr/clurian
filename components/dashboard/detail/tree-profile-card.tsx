"use client";

import React from 'react';
import type { Tree, Log, TreeStatus } from "@/lib/types";
import { useOrchard } from "@/components/providers/orchard-provider";
import { 
    Edit3, 
    Plus, 
    RefreshCw,
    X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TreeProfileCardProps {
  tree: Tree;
  onAddLog: () => void;
  onReplant: () => void;
}

export function TreeProfileCard({ tree, onAddLog, onReplant }: TreeProfileCardProps) {
  const { currentOrchardId, currentOrchard, updateTree, addLog } = useOrchard();

  const handleChangeStatus = (newStatus: TreeStatus) => {
      updateTree(tree.id, { status: newStatus });
      
      const statusLabels: Record<string, string> = { HEALTHY: 'ปกติ', SICK: 'ป่วย', DEAD: 'ตาย' };
      
      addLog({
          id: `temp-${Date.now()}`,
          orchardId: currentOrchardId,
          logType: 'INDIVIDUAL',
          treeId: tree.id,
          performDate: new Date().toISOString().split('T')[0],
          action: `อัพเดทสถานะ: ${statusLabels[newStatus] || newStatus}`,
          note: 'ปรับปรุงสถานะผ่านหน้าข้อมูลต้นไม้',
          status: 'COMPLETED',
          createdAt: new Date().toISOString()
      } as Log);
  };

  const getStatusBadge = (status: string) => {
     switch(status) {
         case 'HEALTHY': return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 shadow-sm px-2.5 py-0.5"><div className="w-2 h-2 rounded-full bg-green-500 mr-1.5" /> ปกติ</Badge>;
         case 'SICK': return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200 shadow-sm px-2.5 py-0.5"><div className="w-2 h-2 rounded-full bg-orange-500 mr-1.5" /> ป่วย/ดูแลพิเศษ</Badge>;
         case 'DEAD': return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 shadow-sm px-2.5 py-0.5"><div className="w-2 h-2 rounded-full bg-red-500 mr-1.5" /> ตาย</Badge>;
         default: return <Badge variant="outline">{status}</Badge>;
     }
  };

  return (
      <div className="bg-card rounded-xl p-6 shadow-sm border relative overflow-hidden">
         {/* Decorative Background */}
          <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-24 h-24 bg-secondary rounded-bl-full -mr-4 -mt-4 z-0 opacity-60"></div>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                  <h2 className="text-3xl font-bold text-foreground">{tree.code}</h2>
                  <p className="text-muted-foreground font-medium text-lg">
                      {tree.type} <span className="text-sm font-normal text-foreground">({tree.variety})</span>
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                      โซน: {tree.zone} | ปลูกเมื่อ: {tree.plantedDate}
                  </p>
                  <p className="text-xs text-primary font-medium mt-2 bg-muted inline-block px-2 py-1 rounded-md border border-border">
                      {currentOrchard?.name || 'ไม่พบข้อมูลสวน'}
                  </p>
              </div>
              
              <div className="flex flex-col items-end gap-2 relative w-full md:w-auto">
                  <div className="flex items-center gap-2">
                      {getStatusBadge(tree.status)}
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <button className="p-1.5 rounded-full transition shadow-sm border bg-white text-gray-500 border-gray-200 hover:bg-gray-50">
                                <Edit3 size={16} />
                              </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 p-2">
                              <div className="flex justify-between items-center mb-2 px-2 border-b border-gray-100 pb-2">
                                    <span className="text-xs font-bold text-gray-600">เปลี่ยนสถานะ:</span>
                                    <X size={12} className="text-gray-400" />
                              </div>
                              <DropdownMenuItem onClick={() => handleChangeStatus('HEALTHY')} className="px-3 py-2.5 text-sm hover:bg-green-50 text-gray-700 font-medium rounded-md flex items-center gap-2 mb-1 cursor-pointer">
                                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm"></div> ปกติ
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeStatus('SICK')} className="px-3 py-2.5 text-sm hover:bg-orange-50 text-gray-700 font-medium rounded-md flex items-center gap-2 mb-1 cursor-pointer">
                                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm"></div> ป่วย/ดูแลพิเศษ
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeStatus('DEAD')} className="px-3 py-2.5 text-sm hover:bg-red-50 text-gray-700 font-medium rounded-md flex items-center gap-2 cursor-pointer">
                                   <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm"></div> ตาย
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
                  
                  {/* QR Code Text */}
                  <div className="w-full md:w-auto flex justify-end">
                       <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border border-gray-200 text-xs text-gray-400 mt-2 shadow-sm">
                           QR Code
                       </div>
                  </div>
              </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button 
                  onClick={onAddLog}
                  className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-opacity"
              >
                  <Plus size={18} /> บันทึกกิจกรรม
              </button>
              {tree.status === 'DEAD' && (
                  <button 
                      onClick={onReplant} 
                      className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground border border-secondary-foreground/20 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:opacity-80 shadow-md transition-opacity"
                  >
                      <RefreshCw size={18} /> ปลูกซ่อม (Replant)
                  </button>
              )}
          </div>
      </div>
  );
}
