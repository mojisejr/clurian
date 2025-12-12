"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Beaker,
  Droplets,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Share
} from 'lucide-react';
import type { ChemicalInput } from '@/lib/mixing-calculator';

interface MixingOrderDisplayProps {
  result: MixingOrderDisplayResult;
  chemicals: ChemicalInput[];
  formulaName?: string;
  formulaDescription?: string;
  onSave?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
}

export interface MixingOrderDisplayResult {
  steps: Array<{
    step: number;
    chemicals: ChemicalInput[];
    description: string;
    timing?: string;
    notes?: string[];
  }>;
  warnings: string[];
  totalSteps: number;
  estimatedTime?: string;
  waterAmount?: number;
}

export function MixingOrderDisplay({
  result,
  chemicals,
  formulaName = "สูตรผสมสารเคมี",
  formulaDescription,
  onSave,
  onShare,
  onPrint
}: MixingOrderDisplayProps) {

  const getStepIcon = (step: number) => {
    const icons = [
      <Beaker key="chelator" className="w-5 h-5" />,     // Chelator
      <Package key="suspended" className="w-5 h-5" />,    // Suspended
      <Droplets key="liquid" className="w-5 h-5" />,   // Liquid
      <Package key="fertilizer" className="w-5 h-5" />,    // Fertilizer
      <Beaker key="adjuvant" className="w-5 h-5" />,     // Adjuvant
      <Droplets key="oil_concentrate" className="w-5 h-5" />,   // Oil Concentrate
      <Droplets key="oil" className="w-5 h-5" />    // Oil
    ];
    return icons[step - 1] || <Beaker key="default" className="w-5 h-5" />;
  };

  const getStepColor = (step: number) => {
    const colors = [
      'bg-blue-100 border-blue-300 text-blue-800',      // Chelator
      'bg-orange-100 border-orange-300 text-orange-800', // Suspended
      'bg-cyan-100 border-cyan-300 text-cyan-800',      // Liquid
      'bg-green-100 border-green-300 text-green-800',    // Fertilizer
      'bg-purple-100 border-purple-300 text-purple-800', // Adjuvant
      'bg-yellow-100 border-yellow-300 text-yellow-800', // Oil Concentrate
      'bg-amber-100 border-amber-300 text-amber-800'     // Oil
    ];
    return colors[step - 1] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const types = {
      chelator: 'สาร Chelator',
      suspended: 'สารแขวนตะกอน',
      liquid: 'สารละลายน้ำ',
      fertilizer: 'ปุ๋ย',
      adjuvant: 'สารควบคุม',
      oil_concentrate: 'น้ำมันเข้มข้น',
      oil: 'น้ำมัน'
    };
    return types[type as keyof typeof types] || type;
  };

  const getTotalQuantity = () => {
    return chemicals.reduce((total, chem) => total + chem.quantity, 0);
  };

  const getUniqueTypes = () => {
    return Array.from(new Set(chemicals.map(c => c.type)));
  };

  const formatDate = () => {
    return new Intl.DateTimeFormat('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg md:text-2xl flex items-center gap-2">
                <Beaker className="w-5 h-5 md:w-6 md:h-6" />
                <span className="truncate">{formulaName}</span>
              </CardTitle>
              {formulaDescription && (
                <CardDescription className="mt-1 text-sm md:text-base line-clamp-2">{formulaDescription}</CardDescription>
              )}
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {onSave && (
                <Button variant="outline" size="sm" onClick={onSave} className="text-xs sm:text-sm">
                  บันทึก
                </Button>
              )}
              {onShare && (
                <Button variant="outline" size="sm" onClick={onShare} className="text-xs sm:text-sm">
                  <Share className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">แชร์</span>
                </Button>
              )}
              {onPrint && (
                <Button variant="outline" size="sm" onClick={onPrint} className="text-xs sm:text-sm">
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">PDF</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-xs md:text-sm md:grid-cols-4 md:gap-4">
            <div className="text-center">
              <span className="text-gray-600 block">วันที่สร้าง</span>
              <div className="font-medium">{formatDate().split(' ')[0]}</div>
            </div>
            <div className="text-center">
              <span className="text-gray-600 block">สารเคมี</span>
              <div className="font-medium">{chemicals.length}</div>
            </div>
            <div className="text-center">
              <span className="text-gray-600 block">ปริมาณรวม</span>
              <div className="font-medium">{getTotalQuantity()}</div>
            </div>
            <div className="text-center">
              <span className="text-gray-600 block">ขั้นตอน</span>
              <div className="font-medium">{result.totalSteps}</div>
            </div>
          </div>

          {/* Chemical Types */}
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-2">ประเภทสารเคมี:</div>
            <div className="flex flex-wrap gap-1">
              {getUniqueTypes().map(type => (
                <Badge key={type} variant="outline">
                  {getTypeLabel(type)}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              คำเตือนและข้อควรระวัง
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-yellow-800">{warning}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Mixing Steps */}
      <div className="space-y-3 md:space-y-4">
        <h3 className="text-lg md:text-xl font-semibold">ขั้นตอนการผสม</h3>

        {result.steps.map((step, index) => (
          <div key={index} className="relative">
            {/* Step Connector */}
            {index < result.steps.length - 1 && (
              <div className="absolute left-4 sm:left-6 top-12 sm:top-16 w-0.5 h-12 sm:h-16 bg-gray-300"></div>
            )}

            <Card className={`${getStepColor(step.step)} border-2`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`p-1.5 sm:p-2 rounded-full ${getStepColor(step.step)}`}>
                    {React.cloneElement(getStepIcon(step.step), {
                      className: "w-3 h-3 sm:w-5 sm:h-5"
                    })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm md:text-base md:text-lg">
                      <span className="hidden sm:inline">ขั้นที่ {step.step}: </span>
                      {step.description}
                    </CardTitle>
                    {step.timing && (
                      <CardDescription className="flex items-center gap-1 mt-1 text-xs md:text-sm">
                        <Clock className="w-3 h-3" />
                        {step.timing}
                      </CardDescription>
                    )}
                  </div>
                  <div className="bg-white bg-opacity-50 px-2 py-1 rounded-full flex-shrink-0">
                    <span className="text-xs font-medium">{step.chemicals.length}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Chemicals in this step */}
                <div className="space-y-2">
                  {step.chemicals.map((chemical, chemIndex) => (
                    <div key={chemIndex} className="flex items-center justify-between bg-white bg-opacity-70 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-current rounded-full"></div>
                        <div>
                          <div className="font-medium">{chemical.name}</div>
                          <div className="text-sm opacity-80">
                            {getTypeLabel(chemical.type)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{chemical.quantity} {chemical.unit}</div>
                        {chemical.formulaType && (
                          <div className="text-sm opacity-80">{chemical.formulaType}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Step Notes */}
                {step.notes && step.notes.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-current border-opacity-30">
                    <div className="text-sm font-medium mb-2">ข้อควรทราบ:</div>
                    <ul className="space-y-1">
                      {step.notes.map((note, noteIndex) => (
                        <li key={noteIndex} className="text-sm flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>สรุปการผสม</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">สารเคมีทั้งหมด</h4>
              <div className="space-y-2">
                {chemicals.map((chemical, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{chemical.name}</span>
                    <span className="font-medium">{chemical.quantity} {chemical.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">ข้อมูลเพิ่มเติม</h4>
              <div className="space-y-2 text-sm">
                {result.estimatedTime && (
                  <div className="flex justify-between">
                    <span>เวลาที่ใช้โดยประมาณ:</span>
                    <span className="font-medium">{result.estimatedTime}</span>
                  </div>
                )}
                {result.waterAmount && (
                  <div className="flex justify-between">
                    <span>ปริมาณน้ำที่แนะนำ:</span>
                    <span className="font-medium">{result.waterAmount} ลิตร</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>จำนวนขั้นตอน:</span>
                  <span className="font-medium">{result.totalSteps} ขั้นตอน</span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">ข้อควรระวังทั่วไป</div>
                <ul className="space-y-1 text-xs">
                  <li>• สวมชุดป้องกันและอุปกรณ์ความปลอดภัยให้ครบถ้วน</li>
                  <li>• ผสมสารเคมีในพื้นที่ที่มีอากาศถ่ายเทได้ดี</li>
                  <li>• อ่านและปฏิบัติตามข้อควรระวังบนฉลากสินค้า</li>
                  <li>• เก็บรักษาสารเคมีให้พ้นจากเด็กและสัตว์เลี้ยง</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}