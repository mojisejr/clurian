"use client";

import { useRef, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface CacheMetrics {
  hitRate: number;
  missRate: number;
  staleTime: number;
  refetchFrequency: number;
  invalidationFrequency: number;
}

export function useCachePerformance() {
  const metricsRef = useRef<CacheMetrics>({
    hitRate: 0,
    missRate: 0,
    staleTime: 0,
    refetchFrequency: 0,
    invalidationFrequency: 0,
  });

  const trackHit = useCallback(() => {
    metricsRef.current.hitRate += 1;
  }, []);

  const trackMiss = useCallback(() => {
    metricsRef.current.missRate += 1;
  }, []);

  const trackRefetch = useCallback(() => {
    metricsRef.current.refetchFrequency += 1;
  }, []);

  const trackInvalidation = useCallback(() => {
    metricsRef.current.invalidationFrequency += 1;
  }, []);

  // Calculate hit rate percentage
  const getHitRate = useCallback(() => {
    const total = metricsRef.current.hitRate + metricsRef.current.missRate;
    return total > 0 ? (metricsRef.current.hitRate / total) * 100 : 0;
  }, []);

  // Get current metrics
  const getMetrics = useCallback((): CacheMetrics & { hitRatePercentage: number } => {
    return {
      ...metricsRef.current,
      hitRatePercentage: getHitRate(),
    };
  }, [getHitRate]);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      hitRate: 0,
      missRate: 0,
      staleTime: 0,
      refetchFrequency: 0,
      invalidationFrequency: 0,
    };
  }, []);

  // Log metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const metrics = getMetrics();
      if (metrics.hitRate > 0 || metrics.missRate > 0) {
        console.log('[Cache Performance]', {
          hitRate: `${metrics.hitRatePercentage.toFixed(2)}%`,
          refetchCount: metrics.refetchFrequency,
          invalidationCount: metrics.invalidationFrequency,
        });
      }
    }, 30000); // Log every 30 seconds

    return () => clearInterval(interval);
  }, [getMetrics]);

  return {
    trackHit,
    trackMiss,
    trackRefetch,
    trackInvalidation,
    getMetrics,
    resetMetrics,
  };
}