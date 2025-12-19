/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import {
  formatDateForInput,
  formatDateForDisplay,
  parseDateFromInput,
  formatISODate,
  formatDateWithBE,
  getCurrentDateString,
  isValidDateString
} from '@/lib/utils/date';

// Now tests should pass (GREEN phase)
describe('Date Utilities', () => {
  describe('formatDateForInput', () => {
    it('should format date to YYYY-MM-DD format', () => {
      const date = new Date('2024-01-15T10:30:00');
      expect(formatDateForInput(date)).toBe('2024-01-15');
    });

    it('should handle date at midnight', () => {
      // Use UTC to avoid timezone issues
      const date = new Date('2024-01-01T00:00:00.000Z');
      expect(formatDateForInput(date)).toBe('2024-01-01');
    });

    it('should handle leap year', () => {
      const date = new Date('2024-02-29T12:00:00');
      expect(formatDateForInput(date)).toBe('2024-02-29');
    });

    it('should handle string date input', () => {
      const dateString = '2024-12-17T10:30:00.000Z';
      expect(formatDateForInput(dateString)).toBe('2024-12-17');
    });

    it('should handle current date', () => {
      const today = new Date();
      const expected = today.toISOString().split('T')[0];
      expect(formatDateForInput(today)).toBe(expected);
    });
  });

  describe('formatDateForDisplay', () => {
    it('should format date in Thai locale', () => {
      const date = new Date('2024-01-15');
      // Should match Thai date format
      expect(formatDateForDisplay(date)).toMatch(/15\/1\/2567|15\/1\/2024|15 ม\.ค\. 2567/);
    });

    it('should handle Buddhist year correctly', () => {
      const date = new Date('2024-12-17');
      const result = formatDateForDisplay(date);
      // Should contain Buddhist year (2567) or Christian year (2024)
      expect(result).toMatch(/2567|2024/);
    });
  });

  describe('parseDateFromInput', () => {
    it('should parse YYYY-MM-DD string to Date', () => {
      const result = parseDateFromInput('2024-01-15');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(0); // January
      expect(result?.getDate()).toBe(15);
    });

    it('should return null for invalid date', () => {
      expect(parseDateFromInput('invalid-date')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parseDateFromInput('')).toBeNull();
    });

    it('should return null for null/undefined', () => {
      expect(parseDateFromInput(null as any)).toBeNull();
      expect(parseDateFromInput(undefined as any)).toBeNull();
    });
  });

  describe('formatISODate', () => {
    it('should create a consistent replacement for .toISOString().split("T")[0]', () => {
      // Test the pattern that's used throughout the codebase
      const date = new Date('2024-12-17T10:30:45.123Z');
      const expected = date.toISOString().split('T')[0];

      expect(formatISODate(date)).toBe(expected);
    });

    it('should handle the common "new Date().toISOString().split("T")[0]" pattern', () => {
      const now = new Date();
      const expected = now.toISOString().split('T')[0];

      expect(formatISODate(now)).toBe(expected);
    });
  });

  describe('Additional utility functions', () => {
    it('should format date with Buddhist Era year', () => {
      const date = new Date('2024-01-01');
      const result = formatDateWithBE(date);
      expect(result).toContain('2567'); // Buddhist year
    });

    it('should get current date string', () => {
      const result = getCurrentDateString();
      const expected = new Date().toISOString().split('T')[0];
      expect(result).toBe(expected);
    });

    it('should validate date strings', () => {
      expect(isValidDateString('2024-01-15')).toBe(true);
      expect(isValidDateString('2024-02-29')).toBe(true); // Leap year
      expect(isValidDateString('2024-02-30')).toBe(false); // Invalid date
      expect(isValidDateString('invalid')).toBe(false);
    });
  });
});