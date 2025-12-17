/**
 * Validation utility functions for orchard management system.
 * These functions provide centralized validation logic for forms and data processing.
 */

import { DURIAN_VARIETIES, LOG_ACTIONS, FERTILIZER_FORMULAS } from '@/lib/constants';

/**
 * Validates tree code format (e.g., T001, M99)
 * Pattern: Letters followed by 2-3 digits
 */
export function validateTreeCode(code: unknown): boolean {
  if (typeof code !== 'string' || !code.trim()) return false;

  // Accept format: Letters (1+) + Digits (2-3)
  // Case insensitive for letters
  const treeCodeRegex = /^[A-Za-z]+\d{2,3}$/;
  return treeCodeRegex.test(code.trim());
}

/**
 * Validates orchard name
 * Rules: non-empty, max 100 characters
 */
export function validateOrchardName(name: unknown): boolean {
  if (typeof name !== 'string') return false;

  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= 100;
}

/**
 * Validates durian variety
 * Must be one of the predefined varieties or common English names (case insensitive)
 */
export function validateTreeVariety(variety: unknown): boolean {
  if (typeof variety !== 'string') return false;

  const trimmed = variety.trim();
  const normalized = trimmed.toLowerCase();

  // Map of English names to Thai varieties
  const englishToThai: Record<string, string> = {
    'chanee': 'หมอนทอง',
    'gan yao': 'ก้านยาว',
    'long lap lae': 'หลงลับแล',
    'puang manee': 'พวงมณี',
    'nok yip': 'นกหยิบ',
    'kradum': 'กระดุม',
    'monthong': 'หมอนทอง' // Common alternative name
  };

  // Check if it's a Thai variety
  if (DURIAN_VARIETIES.some(v => v.toLowerCase() === normalized)) {
    return true;
  }

  // Check if it's an English name that maps to a Thai variety
  const thaiName = englishToThai[normalized];
  if (thaiName && DURIAN_VARIETIES.includes(thaiName as typeof DURIAN_VARIETIES[number])) {
    return true;
  }

  return false;
}

/**
 * Validates that a string is not empty
 */
export function validateRequiredString(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return value.trim().length > 0;
}

/**
 * Validates email format
 */
export function validateEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates Thai phone number format
 * Accepts various formats: 0xxxxxxxxx, +66xxxxxxxxx, xxx-xxx-xxxx
 */
export function validatePhoneNumber(phone: unknown): boolean {
  if (typeof phone !== 'string') return false;

  const cleanPhone = phone.trim().replace(/[-\s]/g, '');

  // Thai format:
  // 1. 10 digits starting with 0 (mobile or landline)
  // 2. +66 followed by 9 digits (international format)
  const thaiPhoneRegex = /^(0\d{9}|\+66\d{9})$/;
  return thaiPhoneRegex.test(cleanPhone);
}

/**
 * Validates zone name or identifier
 * Very flexible - just requires non-empty string
 */
export function validateZone(zone: unknown): boolean {
  return validateRequiredString(zone);
}

/**
 * Validates chemical/fertilizer formula
 * Format: N-P-K where each is a number
 * Examples: 15-15-15, 16-16-16, 46-0-0
 */
export function validateChemicalFormula(formula: unknown): boolean {
  if (typeof formula !== 'string') return false;

  const trimmed = formula.trim();

  // Check if it's in the predefined list
  if (FERTILIZER_FORMULAS.includes(trimmed as typeof FERTILIZER_FORMULAS[number])) return true;

  // Validate NPK format: three numbers separated by dashes
  const npkRegex = /^(\d{1,2})-(\d{1,2})-(\d{1,2})$/;
  const match = trimmed.match(npkRegex);

  if (!match) return false;

  const [, n, p, k] = match.map(Number);

  // Validate ranges (common NPK ranges)
  // N: 0-100, P: 0-100, K: 0-100
  return n >= 0 && n <= 100 && p >= 0 && p <= 100 && k >= 0 && k <= 100;
}

/**
 * Validates pagination parameters
 */
export function validatePaginationParams(params: {
  page?: unknown;
  limit?: unknown;
}): { page: number; limit: number } {
  const { page = 1, limit = 10 } = params;

  // Handle null/undefined values by using defaults
  let pageValue: number;
  let limitValue: number;

  if (page === null || page === undefined) {
    pageValue = 1;
  } else if (typeof page === 'object' && page !== null) {
    // Objects cannot be converted to numbers reliably
    throw new Error('Page must be a valid number');
  } else {
    pageValue = Number(page);
  }

  if (limit === null || limit === undefined) {
    limitValue = 10;
  } else if (typeof limit === 'object' && limit !== null) {
    // Objects cannot be converted to numbers reliably
    throw new Error('Limit must be a valid number');
  } else {
    limitValue = Number(limit);
  }

  if (isNaN(pageValue) || isNaN(limitValue)) {
    throw new Error('Page and limit must be valid numbers');
  }

  // Apply constraints
  const validatedPage = Math.max(1, Math.min(pageValue, 10000));
  const validatedLimit = Math.max(1, Math.min(limitValue, 100));

  return {
    page: validatedPage,
    limit: validatedLimit
  };
}

/**
 * Validates log action
 * Must be one of the predefined log actions
 */
export function validateLogAction(action: unknown): boolean {
  if (typeof action !== 'string') return false;

  return LOG_ACTIONS.includes(action.trim() as typeof LOG_ACTIONS[number]);
}

/**
 * Validates date string in YYYY-MM-DD format
 */
export function validateDateString(dateString: unknown): boolean {
  if (typeof dateString !== 'string') return false;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validates that a number is within a range
 */
export function validateNumberRange(
  value: unknown,
  min: number,
  max: number
): boolean {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
}

/**
 * Validates coordinate (latitude/longitude)
 */
export function validateCoordinate(coord: unknown): boolean {
  const num = Number(coord);
  if (isNaN(num)) return false;

  // Most reasonable coordinate ranges
  return num >= -180 && num <= 180;
}

/**
 * Validates latitude specifically (-90 to 90)
 */
export function validateLatitude(lat: unknown): boolean {
  const num = Number(lat);
  if (isNaN(num)) return false;

  return num >= -90 && num <= 90;
}

/**
 * Validates longitude specifically (-180 to 180)
 */
export function validateLongitude(lng: unknown): boolean {
  const num = Number(lng);
  if (isNaN(num)) return false;

  return num >= -180 && num <= 180;
}

/**
 * Validates tree planting date
 * Should be a valid date and not in the future
 */
export function validatePlantingDate(date: unknown): boolean {
  if (!validateDateString(date)) return false;

  const plantingDate = new Date(date as string);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Remove time component

  return plantingDate <= today;
}

/**
 * Validates follow-up date
 * Should be a valid date and in the future
 */
export function validateFollowUpDate(date: unknown): boolean {
  if (!validateDateString(date)) return false;

  const followUpDate = new Date(date as string);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Remove time component

  return followUpDate >= today;
}

/**
 * Validates array of tree codes
 * All codes in the array must be valid
 */
export function validateTreeCodes(codes: unknown[]): boolean {
  if (!Array.isArray(codes)) return false;

  return codes.every((code): code is string => validateTreeCode(code));
}

/**
 * Validates tree status (uppercase format)
 */
export function validateTreeStatus(status: unknown): status is 'HEALTHY' | 'SICK' | 'DEAD' | 'ARCHIVED' {
  if (typeof status !== 'string') return false;

  const validStatuses = ['HEALTHY', 'SICK', 'DEAD', 'ARCHIVED'];
  return validStatuses.includes(status.trim() as 'HEALTHY' | 'SICK' | 'DEAD' | 'ARCHIVED');
}

/**
 * Validates UI tree status (lowercase format)
 */
export function validateUITreeStatus(status: unknown): status is 'healthy' | 'sick' | 'dead' | 'archived' {
  if (typeof status !== 'string') return false;

  const validStatuses = ['healthy', 'sick', 'dead', 'archived'];
  return validStatuses.includes(status.trim() as 'healthy' | 'sick' | 'dead' | 'archived');
}