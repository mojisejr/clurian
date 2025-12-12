"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Search, Filter, Trash2, Eye, Plus } from 'lucide-react';
import { getMixingFormulasByOrchard, deleteMixingFormula, updateMixingFormulaUsage } from '@/app/actions/mixing-formulas';
import type { MixingFormula } from '@prisma/client';

interface FormulaWithComponents extends MixingFormula {
  components: {
    name: string;
    type: string;
    quantity: number;
    unit: string;
    formulaType?: string;
    step: number;
  }[];
}

interface MixingHistoryProps {
  orchardId: string;
  onSelectFormula?: (formula: FormulaWithComponents) => void;
  onShowCalculator?: () => void;
}

export function MixingHistory({ orchardId, onSelectFormula, onShowCalculator }: MixingHistoryProps) {
  const [formulas, setFormulas] = useState<FormulaWithComponents[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'usedCount'>('createdAt');
  const [filterType, setFilterType] = useState<'all' | 'recent' | 'mostUsed'>('all');

  const loadFormulas = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMixingFormulasByOrchard(orchardId);
      if (result.success && result.data) {
        // Transform the data to include components
        const formulasWithComponents = result.data.map(formula => ({
          ...formula,
          components: (formula.components as FormulaWithComponents['components']) || []
        }));
        setFormulas(formulasWithComponents);
      } else {
        console.error('Failed to load formulas:', result.error);
        setFormulas([]);
      }
    } catch (error) {
      console.error('Error loading formulas:', error);
      setFormulas([]);
    } finally {
      setLoading(false);
    }
  }, [orchardId]);

  useEffect(() => {
    if (orchardId) {
      loadFormulas();
    }
  }, [orchardId, loadFormulas]);

  const handleDeleteFormula = async (formulaId: string) => {
    if (!confirm('คุณแน่ใจว่าต้องการลบสูตรนี้หรือไม่?')) {
      return;
    }

    try {
      const result = await deleteMixingFormula(formulaId);
      if (result.success) {
        setFormulas(formulas.filter(f => f.id !== formulaId));
        alert('ลบสูตรสำเร็จแล้ว');
      } else {
        alert('ลบสูตรไม่สำเร็จ: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting formula:', error);
      alert('เกิดข้อผิดพลาดในการลบสูตร');
    }
  };

  const handleUseFormula = async (formula: FormulaWithComponents) => {
    try {
      await updateMixingFormulaUsage(formula.id);
      // Update used count in UI
      setFormulas(prev =>
        prev.map(f => f.id === formula.id ? { ...f, usedCount: f.usedCount + 1 } : f)
      );
      onSelectFormula?.(formula);
    } catch (error) {
      console.error('Error updating formula usage:', error);
      onSelectFormula?.(formula);
    }
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const filteredAndSortedFormulas = formulas
    .filter(formula => {
      const matchesSearch = formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (formula.description && formula.description.toLowerCase().includes(searchTerm.toLowerCase()));

      if (filterType === 'recent') {
        const createdAt = new Date(formula.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return matchesSearch && createdAt > weekAgo;
      } else if (filterType === 'mostUsed') {
        return matchesSearch && formula.usedCount > 0;
      }

      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'th');
      } else if (sortBy === 'usedCount') {
        return b.usedCount - a.usedCount;
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const getTotalChemicals = (components: FormulaWithComponents['components']) => {
    return components.length;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">ประวัติสูตรผสมสารเคมี</h2>
          <p className="text-sm md:text-base text-gray-600">จัดการและเลือกใช้สูตรผสมที่บันทึกไว้</p>
        </div>
        <Button onClick={onShowCalculator} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          สร้างสูตรใหม่
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-4 h-4" />
            ค้นหาและกรอง
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="ค้นหาชื่อสูตรหรือรายละเอียด..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select value={filterType} onValueChange={(value: typeof filterType) => setFilterType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="กรองตาม..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสูตร</SelectItem>
                <SelectItem value="recent">สูตรล่าสุด (7 วัน)</SelectItem>
                <SelectItem value="mostUsed">สูตรที่ใช้บ่อย</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="เรียงตาม..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">วันที่สร้าง</SelectItem>
                <SelectItem value="name">ชื่อสูตร</SelectItem>
                <SelectItem value="usedCount">จำนวนครั้งที่ใช้</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Formulas List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      ) : filteredAndSortedFormulas.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <Clock className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {searchTerm || filterType !== 'all' ? 'ไม่พบสูตรที่ตรงกับเงื่อนไข' : 'ยังไม่มีสูตรที่บันทึกไว้'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterType !== 'all'
                ? 'ลองเปลี่ยนเงื่อนไขการค้นหาหรือกรอง'
                : 'เริ่มสร้างสูตรผสมแรกของคุณเพื่อใช้ในการจัดการสวน'
              }
            </p>
            <Button onClick={onShowCalculator}>
              <Plus className="w-4 h-4 mr-2" />
              สร้างสูตรแรก
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAndSortedFormulas.map((formula) => (
            <Card key={formula.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base md:text-lg truncate">{formula.name}</CardTitle>
                    {formula.description && (
                      <CardDescription className="mt-1 text-xs md:text-sm line-clamp-2">{formula.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUseFormula(formula)}
                      className="whitespace-nowrap px-2 sm:px-3 h-8"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline ml-1">ใช้</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteFormula(formula.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 sm:px-3 h-8"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Formula Stats */}
                  <div className="grid grid-cols-3 gap-2 text-xs md:text-sm text-gray-600">
                    <div className="flex flex-col items-center text-center">
                      <span className="font-medium">สารเคมี</span>
                      <span>{getTotalChemicals(formula.components)}</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <span className="font-medium">ใช้แล้ว</span>
                      <span>{formula.usedCount}</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <Clock className="w-3 h-3 mb-1" />
                      <span className="text-xs">{formatDate(formula.createdAt).split(' ')[0]}</span>
                    </div>
                  </div>

                  {/* Chemicals Preview */}
                  <div className="flex flex-wrap gap-1">
                    {formula.components.slice(0, 5).map((component, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {component.name} ({component.quantity} {component.unit})
                      </Badge>
                    ))}
                    {formula.components.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{formula.components.length - 5} ชนิด
                      </Badge>
                    )}
                  </div>

                  {/* Chemical Types Summary */}
                  <div className="flex flex-wrap gap-1 text-xs">
                    {Array.from(new Set(formula.components.map(c => c.type))).map(type => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {getTypeLabel(type)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}