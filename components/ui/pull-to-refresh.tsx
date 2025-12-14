"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
  threshold?: number;
  className?: string;
}

export function PullToRefresh({
  onRefresh,
  children,
  disabled = false,
  threshold = 60,
  className,
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const startY = useRef(0);
  const currentY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if touch device
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isLoading) return;

    // Only enable pull-to-refresh when at the top of the scroll
    if (window.scrollY > 0) return;

    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || disabled || isLoading) return;

    currentY.current = e.touches[0].clientY;
    const distance = currentY.current - startY.current;

    // Only allow pulling down (positive distance)
    if (distance > 0) {
      // Apply resistance to make it feel more natural
      const resistance = 0.5;
      const adjustedDistance = distance * resistance;

      setPullDistance(Math.min(adjustedDistance, threshold * 2));

      // Prevent default scrolling behavior when pulling
      if (distance > 10) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling || disabled || isLoading) return;

    if (pullDistance >= threshold) {
      // Trigger refresh
      setIsLoading(true);
      try {
        await onRefresh();
      } finally {
        setIsLoading(false);
      }
    }

    // Reset state
    setIsPulling(false);
    setPullDistance(0);
    startY.current = 0;
    currentY.current = 0;
  };

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const showIndicator = isTouchDevice && (isPulling || isLoading);

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      data-testid="pull-to-refresh-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      {showIndicator && (
        <div
          className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center bg-background border-b transition-transform duration-200 ease-out"
          style={{
            transform: `translateY(${
              isLoading ? '0px' : `${Math.min(pullDistance, threshold)}px`
            })`,
            height: `${threshold}px`,
          }}
          data-testid="pull-indicator"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2
                className="h-4 w-4 animate-spin"
                data-testid="pull-spinner"
              />
              <span>กำลังรีเฟรช...</span>
            </div>
          ) : (
            <div
              className="flex flex-col items-center gap-1 text-sm text-muted-foreground transition-opacity duration-200"
              style={{
                opacity: pullProgress,
              }}
            >
              <ChevronDown
                className="h-4 w-4 transition-transform duration-200"
                style={{
                  transform: `rotate(${pullProgress * 180}deg)`,
                }}
              />
              <span>
                {pullProgress >= 1 ? 'ปล่อยเพื่อรีเฟรช' : 'ดึงลงเพื่อรีเฟรช'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          "transition-transform duration-200 ease-out",
          showIndicator && !isLoading && "transform-gpu"
        )}
        style={{
          transform: isLoading
            ? `translateY(${threshold}px)`
            : isPulling
              ? `translateY(${Math.min(pullDistance, threshold)}px)`
              : 'translateY(0)',
        }}
      >
        {children}
      </div>
    </div>
  );
}