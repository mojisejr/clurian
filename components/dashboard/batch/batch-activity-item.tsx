"use client";

import React from 'react';
import type { Log } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";

interface BatchActivityItemProps {
  log: Log;
  onClick?: (log: Log) => void;
}

export function BatchActivityItem({ log, onClick }: BatchActivityItemProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(log);
    }
  };

  return (
    <div
      className="p-4 hover:bg-accent/50 cursor-pointer transition-colors group border-b last:border-b-0"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {log.action}
          </span>
          {log.status === 'in-progress' && (
            <Badge variant="outline" className="text-[10px] h-5 px-1 bg-yellow-50 text-yellow-700 border-yellow-200">
              รอติดตาม
            </Badge>
          )}
          <Badge variant="secondary" className="text-[10px] h-5 px-1">
            งานทั้งแปลง
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
          <Clock size={12} /> {log.date}
        </span>
      </div>

      {log.zone && (
        <div className="flex items-center gap-1 mb-1">
          <MapPin size={12} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            โซน: {log.zone}
          </span>
        </div>
      )}

      {log.note && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {log.note}
        </p>
      )}
    </div>
  );
}