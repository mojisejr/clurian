"use client";

import { Calendar, MapPin, Clock, MoreHorizontal, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Log } from "@/lib/types";
import { formatDateThai } from "@/lib/date-utils";

interface ActivityCardProps {
  activity: Log;
  showZone?: boolean;
  showTreeInfo?: boolean;
  onQuickComplete?: (activityId: string) => void;
  onViewDetails?: (activity: Log) => void;
  onEdit?: (activity: Log) => void;
  onDelete?: (activityId: string) => void;
}

export function ActivityCard({
  activity,
  showZone = false,
  showTreeInfo = false,
  onQuickComplete,
  onViewDetails,
  onEdit,
  onDelete,
}: ActivityCardProps) {
  const isOverdue = activity.followUpDate
    ? new Date(activity.followUpDate) < new Date(new Date().setHours(0, 0, 0, 0))
    : false;

  const isToday = activity.followUpDate
    ? new Date(activity.followUpDate).toDateString() === new Date().toDateString()
    : false;

  const isUpcoming = activity.followUpDate
    ? new Date(activity.followUpDate) > new Date()
    : false;

  const getStatusVariant = () => {
    if (activity.status === "COMPLETED") {
      return "default";
    }
    if (isOverdue) {
      return "destructive";
    }
    if (isToday) {
      return "secondary";
    }
    return "outline";
  };

  const getStatusText = () => {
    if (activity.status === "COMPLETED") {
      return "เสร็จสิ้น";
    }
    if (isOverdue) {
      return "เลยกำหนด";
    }
    if (isToday) {
      return "วันนี้";
    }
    return "กำลังดำเนินการ";
  };

  const getPriorityBorderColor = () => {
    if (activity.status === "COMPLETED") {
      return "border-green-200";
    }
    if (isOverdue) {
      return "border-red-200";
    }
    if (isToday) {
      return "border-yellow-200";
    }
    if (isUpcoming) {
      return "border-green-200";
    }
    return "";
  };

  const getActionIcon = () => {
    switch (activity.action) {
      case "ให้น้ำ":
        return "💧";
      case "ให้ปุ๋ย":
        return "🌱";
      case "ตัดแต่ง":
        return "✂️";
      case "กำจัดวัชพืช":
        return "🌿";
      case "ป้องกันแมลง":
        return "🐛";
      case "เก็บเกี่ยว":
        return "🍎";
      case "ตรวจสอบสุขภาพ":
        return "🔍";
      default:
        return "📋";
    }
  };

  return (
    <Card className={`p-4 hover:shadow-md transition-shadow ${getPriorityBorderColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getActionIcon()}</span>
            <h3 className="font-medium">{activity.action}</h3>
            <Badge variant={getStatusVariant()} className="text-xs">
              {getStatusText()}
            </Badge>
          </div>

          {activity.note && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {activity.note}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDateThai(activity.performDate)}</span>
            </div>

            {showZone && activity.targetZone && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{activity.targetZone}</span>
              </div>
            )}

            {showTreeInfo && activity.treeId && (
              <div className="flex items-center gap-1">
                <span className="font-medium">ต้นที่:</span>
                <span>{activity.treeId}</span>
              </div>
            )}

            {activity.followUpDate && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                  ติดตาม: {formatDateThai(activity.followUpDate)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          {activity.status === "IN_PROGRESS" && onQuickComplete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onQuickComplete(activity.id)}
              className="h-8 px-2 text-green-600 hover:text-green-700"
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onViewDetails && (
                <DropdownMenuItem onClick={() => onViewDetails(activity)}>
                  ดูรายละเอียด
                </DropdownMenuItem>
              )}
              {onEdit && activity.status === "IN_PROGRESS" && (
                <DropdownMenuItem onClick={() => onEdit(activity)}>
                  แก้ไข
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(activity.id)}
                  className="text-red-600"
                >
                  ลบ
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}