import type { PaginationMetadata } from '@/lib/types';

/**
 * Creates pagination metadata for API responses
 */
export function createPaginationMetadata(
  page: number,
  limit: number,
  total: number
): PaginationMetadata {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Calculates skip value for Prisma queries based on page and limit
 */
export function calculateSkip(page: number, limit: number): number {
  if (page < 1) return 0;
  return (page - 1) * limit;
}

/**
 * Validates pagination parameters
 */
export function validatePaginationParams(
  page?: number,
  limit?: number
): { page: number; limit: number } {
  const validatedPage = Math.max(1, page || 1);
  const validatedLimit = Math.min(Math.max(1, limit || 100), 1000); // Max 1000 items per page

  return {
    page: validatedPage,
    limit: validatedLimit,
  };
}

/**
 * Default pagination options
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 100,
} as const;

/**
 * Common pagination options for different use cases
 */
export const PAGINATION_OPTIONS = {
  DASHBOARD: { limit: 100 },
  TABLE: { limit: 20 },
  MOBILE: { limit: 10 },
  EXPORT: { limit: 1000 },
} as const;