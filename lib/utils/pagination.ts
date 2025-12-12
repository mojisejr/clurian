import { z } from 'zod';
import type { PaginationMetadata } from '@/lib/types';

// Enhanced error classes for better error handling
export class PaginationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PaginationError';
  }
}

export class ValidationError extends PaginationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

// Pagination configuration with environment-specific defaults
export const PAGINATION_CONFIG = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: process.env.NODE_ENV === 'development' ? 1000 : 100,
  DASHBOARD_LIMIT: 100,
  SEARCH_LIMIT: 50,
  DEFAULT_PAGE: 1,
} as const;

// Zod schemas for validation
export const PaginationParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION_CONFIG.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION_CONFIG.MAX_LIMIT)
    .default(PAGINATION_CONFIG.DEFAULT_LIMIT),
});

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

/**
 * Enhanced pagination metadata creation with comprehensive error handling
 */
export function createPaginationMetadata(
  page: number,
  limit: number,
  total: number
): PaginationMetadata {
  try {
    // Validate inputs
    const totalPages = Math.ceil(total / limit) || 0;

    // Ensure values are within reasonable bounds
    const validatedPage = Math.max(1, Math.min(page, 10000));
    const validatedLimit = Math.max(1, Math.min(limit, PAGINATION_CONFIG.MAX_LIMIT));
    const validatedTotal = Math.max(0, total);

    return {
      page: validatedPage,
      limit: validatedLimit,
      total: validatedTotal,
      totalPages,
      hasNext: validatedPage * validatedLimit < validatedTotal,
      hasPrev: validatedPage > 1,
    };
  } catch (error) {
    if (error instanceof PaginationError) {
      throw error;
    }
    throw new PaginationError(
      'Failed to create pagination metadata',
      'METADATA_CREATION_ERROR',
      { page, limit, total, originalError: error }
    );
  }
}

/**
 * Enhanced pagination parameter validation with detailed error messages
 */
export function validatePaginationParams(
  page?: number,
  limit?: number
): { page: number; limit: number } {
  try {
    const result = PaginationParamsSchema.parse({ page, limit });
    return { page: result.page, limit: result.limit };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.reduce((acc, issue) => {
        acc[issue.path.join('.')] = {
          value: 'received' in issue ? issue.received : undefined,
          message: issue.message,
        };
        return acc;
      }, {} as Record<string, { value: unknown; message: string }>);

      throw new ValidationError(
        'Invalid pagination parameters',
        details
      );
    }
    throw new PaginationError(
      'Failed to validate pagination parameters',
      'VALIDATION_ERROR',
      { page, limit, originalError: error }
    );
  }
}

/**
 * Calculate skip value for database queries with safety checks
 */
export function calculateSkip(page: number, limit: number): number {
  const validation = validatePaginationParams(page, limit);
  return (validation.page - 1) * validation.limit;
}

/**
 * Build pagination query options for Prisma with enhanced safety
 */
export function buildPaginationQuery(
  page: number,
  limit: number,
  additionalOptions?: Record<string, unknown>
) {
  const { page: validatedPage, limit: validatedLimit } = validatePaginationParams(
    page,
    limit
  );

  return {
    skip: calculateSkip(validatedPage, validatedLimit),
    take: validatedLimit,
    ...additionalOptions,
  };
}

/**
 * Debounce helper for pagination-related searches
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Type guard to check if an object is a PaginationError
 */
export function isPaginationError(error: unknown): error is PaginationError {
  return error instanceof Error && error.name === 'PaginationError';
}

/**
 * Legacy pagination options for backward compatibility
 * @deprecated Use PAGINATION_CONFIG instead
 */
export const PAGINATION_OPTIONS = {
  DASHBOARD: { limit: PAGINATION_CONFIG.DASHBOARD_LIMIT },
  TABLE: { limit: PAGINATION_CONFIG.DEFAULT_LIMIT },
  MOBILE: { limit: 10 },
  EXPORT: { limit: 1000 },
} as const;

/**
 * Default pagination options
 * @deprecated Use PAGINATION_CONFIG instead
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: PAGINATION_CONFIG.DEFAULT_LIMIT,
} as const;