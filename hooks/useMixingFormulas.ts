"use client";

import { useState, useEffect, useCallback } from "react";
import { type MixingFormula } from "@/components/forms/add-log-form";
import { getMixingFormulasByOrchard } from "@/app/actions/mixing-formulas";

interface UseMixingFormulasOptions {
  enabled?: boolean;
  orchardId?: string;
}

interface UseMixingFormulasReturn {
  mixingFormulas: MixingFormula[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook สำหรับดึงข้อมูลสูตรยาตาม orchard
 *
 * @param options.enabled - เปิด/ปิดการดึงข้อมูล (default: true)
 * @param options.orchardId - ID ของ orchard
 * @returns object ที่มีข้อมูลสูตรยา สถานะการโหลด และฟังก์ชัน refetch
 */
export function useMixingFormulas({
  enabled = true,
  orchardId
}: UseMixingFormulasOptions = {}): UseMixingFormulasReturn {
  const [mixingFormulas, setMixingFormulas] = useState<MixingFormula[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMixingFormulas = useCallback(async () => {
    if (!enabled || !orchardId) {
      setMixingFormulas([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getMixingFormulasByOrchard(orchardId);

      if (result.success && result.data) {
        // Map Prisma data to MixingFormula interface
        const formulas: MixingFormula[] = result.data.map(f => ({
          id: f.id,
          name: f.name,
          description: f.description || undefined
        }));
        setMixingFormulas(formulas);
      } else {
        setError(result.error || 'ไม่สามารถดึงข้อมูลสูตรยาได้');
        setMixingFormulas([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่คาดคิด';
      console.error('Failed to load mixing formulas:', err);
      setError(errorMessage);
      setMixingFormulas([]);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, orchardId]);

  useEffect(() => {
    fetchMixingFormulas();
  }, [fetchMixingFormulas]);

  return {
    mixingFormulas,
    isLoading,
    error,
    refetch: fetchMixingFormulas,
  };
}