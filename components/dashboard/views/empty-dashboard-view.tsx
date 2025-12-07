"use client";

import React from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface EmptyDashboardViewProps {
  onCreateOrchard: () => void;
}

export function EmptyDashboardView({ onCreateOrchard }: EmptyDashboardViewProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl">
        <div className="mx-auto w-24 h-24 bg-green-50 rounded-full flex items-center justify-center p-4">
           <Image
            src="/logo-1.png"
            alt="Clurian Logo"
            width={80}
            height={80}
            className="w-full h-full object-contain"
            priority
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ยินดีต้อนรับสู่ Clurian</h2>
          <p className="text-gray-500 mt-2">
            เริ่มจัดการสวนของคุณได้ง่ายๆ เพียงสร้างสวนแรกของคุณ
          </p>
        </div>
        <Button
          onClick={onCreateOrchard}
          className="w-full h-12 text-lg gap-2 shadow-lg animate-pulse"
        >
          <PlusCircle size={20} /> สร้างสวนใหม่
        </Button>
      </Card>
    </div>
  );
}
