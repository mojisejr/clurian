"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, ReactNode } from 'react';

interface QueryClientProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryClientProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default stale time of 5 minutes
            staleTime: 5 * 60 * 1000,
            // Default cache time of 10 minutes
            gcTime: 10 * 60 * 1000,
            // Disable refetch on window focus for better UX
            refetchOnWindowFocus: false,
            // Retry failed queries 3 times
            retry: 3,
            // Retry with exponential backoff
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
            // Don't retry mutations with 4xx errors
            retryDelay: 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}