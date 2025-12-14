"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RefreshButtonProps {
  onClick: () => void | Promise<void>;
  label: string;
  loading?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  tooltip?: string;
  disabled?: boolean;
  className?: string;
}

export function RefreshButton({
  onClick,
  label,
  loading: externalLoading,
  variant = 'default',
  size = 'default',
  tooltip,
  disabled,
  className,
}: RefreshButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = externalLoading || internalLoading;

  const handleClick = async () => {
    if (isLoading || disabled) return;

    setInternalLoading(true);
    try {
      await onClick();
    } finally {
      setInternalLoading(false);
    }
  };

  const button = (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading}
      variant={variant}
      size={size}
      className={cn("relative", className)}
      aria-label={tooltip || label}
    >
      {isLoading ? (
        <Loader2
          className="h-4 w-4 animate-spin"
          data-testid="refresh-spinner"
        />
      ) : (
        <RefreshCw
          className="h-4 w-4"
          data-testid="refresh-icon"
        />
      )}
      {size !== 'icon' && (
        <span className="ml-2">{label}</span>
      )}

      {/* Screen reader announcement for status updates */}
      {isLoading && (
        <span
          className="sr-only"
          aria-live="polite"
          data-testid="refresh-status"
        >
          กำลังรีเฟรชข้อมูล
        </span>
      )}
    </Button>
  );

  // Add tooltip if provided
  if (tooltip && size === 'icon') {
    return (
      <div className="relative group">
        {button}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      </div>
    );
  }

  return button;
}