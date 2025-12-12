"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: this.generateErrorId(),
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
      errorId: this.generateErrorId(),
    });

    // Log error to monitoring service
    this.logError(error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', {
        error,
        errorInfo,
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // In production, send to error monitoring service
    // Example: Sentry, LogRocket, etc.
    try {
      // Placeholder for error monitoring service
      // errorMonitoringService.captureException(error, {
      //   extra: {
      //     errorInfo,
      //     errorId: this.state.errorId,
      //     componentStack: errorInfo.componentStack,
      //   },
      // });
    } catch (monitoringError) {
      // Fallback to console if monitoring service fails
      console.error('Failed to log error to monitoring service:', monitoringError);
    }
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        errorId: this.generateErrorId(),
      });
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private copyErrorDetails = async () => {
    const { error, errorInfo, errorId } = this.state;
    const errorDetails = {
      errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : null,
      componentStack: errorInfo?.componentStack,
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      alert('คัดลอกรายละเอียดข้อผิดพลาดแล้ว');
    } catch {
      alert('ไม่สามารถคัดลอกรายละเอียดข้อผิดพลาดได้');
    }
  };

  render() {
    if (this.state.hasError) {
      // If custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[200px] flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-red-200 bg-red-50/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-800">เกิดข้อผิดพลาด</CardTitle>
              <CardDescription className="text-red-600">
                ขออภัยในความไม่สะดวก ระบบขัดข้องชั่วคราว
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.props.showErrorDetails !== false && (
                <details className="bg-red-100 p-3 rounded-lg text-sm">
                  <summary className="font-medium text-red-800 cursor-pointer">
                    รายละเอียดข้อผิดพลาด (Development Mode)
                  </summary>
                  <pre className="mt-2 text-xs text-red-700 whitespace-pre-wrap overflow-auto max-h-32">
                    {this.state.error?.stack}
                  </pre>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="mt-2 text-xs text-red-700 whitespace-pre-wrap overflow-auto max-h-32">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </details>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  onClick={this.handleRetry}
                  disabled={this.retryCount >= this.maxRetries}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {this.retryCount >= this.maxRetries
                    ? 'ลองใหม่ครั้งต่อไป'
                    : `ลองใหม่ (${this.retryCount}/${this.maxRetries})`}
                </Button>

                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  โหลดหน้าใหม่
                </Button>

                <Button
                  onClick={this.copyErrorDetails}
                  variant="ghost"
                  className="w-full text-xs"
                >
                  <Bug className="h-3 w-3 mr-1" />
                  คัดลอกรายละเอียดข้อผิดพลาด
                </Button>
              </div>

              <p className="text-xs text-red-600 text-center">
                รหัสข้อผิดพลาด: {this.state.errorId}
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      // Log error
      console.error('Error caught by useErrorHandler:', error);

      // In production, send to monitoring service
      if (process.env.NODE_ENV === 'production') {
        // errorMonitoringService.captureException(error);
      }
    }
  }, [error]);

  return { error, handleError, resetError };
}

// Error fallback component for specific sections
export function ErrorFallback({
  title = "เกิดข้อผิดพลาด",
  description = "ไม่สามารถโหลดข้อมูลได้ชั่วคราว",
  onRetry,
  showRetry = true,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        {showRetry && onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            ลองใหม่
          </Button>
        )}
      </CardContent>
    </Card>
  );
}