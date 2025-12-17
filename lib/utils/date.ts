/**
 * Date utility functions to replace repetitive date formatting patterns
 * throughout the codebase. These functions provide consistent date handling
 * for Thai locale applications.
 */

/**
 * Formats date for HTML input field (YYYY-MM-DD format)
 * This is a direct replacement for: new Date(date).toISOString().split('T')[0]
 *
 * @param date - Date object or date string
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Formats date for display in Thai locale
 * Uses Buddhist calendar (BE) years for Thai users
 *
 * @param date - Date object or date string
 * @returns Formatted date string in Thai locale
 */
export function formatDateForDisplay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Parses date string from input format (YYYY-MM-DD)
 * Returns a Date object with time set to midnight in local timezone
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object or null if invalid
 */
export function parseDateFromInput(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;

  const date = new Date(dateString + 'T00:00:00');
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Direct replacement for the most common pattern in the codebase:
 * new Date().toISOString().split('T')[0]
 *
 * @param date - Date object (defaults to current date)
 * @returns Date string in YYYY-MM-DD format
 */
export function formatISODate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

/**
 * Formats date to Thai Buddhist Era (BE) year format
 * Adds 543 to the Christian year
 *
 * @param date - Date object or date string
 * @returns Date string with Buddhist year
 */
export function formatDateWithBE(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const buddhistYear = d.getFullYear() + 543;

  // Format manually since toLocaleDateString doesn't support custom years
  const thaiMonthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  return `${d.getDate()} ${thaiMonthNames[d.getMonth()]} พ.ศ. ${buddhistYear}`;
}

/**
 * Gets current date in YYYY-MM-DD format
 * Common replacement for: new Date().toISOString().split('T')[0]
 *
 * @returns Current date in YYYY-MM-DD format
 */
export function getCurrentDateString(): string {
  return formatISODate();
}

/**
 * Checks if a date string is valid
 * More robust validation that checks for actual valid dates
 *
 * @param dateString - Date string to validate
 * @returns true if date is valid
 */
export function isValidDateString(dateString: string): boolean {
  // Check if it's a proper YYYY-MM-DD format first
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  const [year, month, day] = dateString.split('-').map(Number);

  // Check basic ranges
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  // Create date and check if it matches (handles invalid dates like Feb 30)
  const date = new Date(dateString);

  // Check if date creation was successful and the date matches
  if (isNaN(date.getTime())) {
    return false;
  }

  // Additional check: the date object should have the same year, month, day
  // This catches invalid dates like 2024-02-30 which JavaScript converts to Mar 1
  const dateISOString = date.toISOString();
  const expectedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

  return dateISOString.startsWith(expectedDate);
}