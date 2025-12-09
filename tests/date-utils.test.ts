import { describe, it, expect } from 'vitest';
import {
  isToday,
  isOverdue,
  isUpcoming,
  formatDateThai,
  groupActivitiesByDate,
  getRelativeDateLabel
} from '@/lib/date-utils';

describe('Date Utils', () => {
  describe('isToday', () => {
    it('should return true for today', () => {
      const today = new Date();
      expect(isToday(today.toISOString())).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday.toISOString())).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isToday(tomorrow.toISOString())).toBe(false);
    });
  });

  describe('isOverdue', () => {
    it('should return true for past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isOverdue(yesterday.toISOString())).toBe(true);
    });

    it('should return false for today', () => {
      const today = new Date();
      expect(isOverdue(today.toISOString())).toBe(false);
    });

    it('should return false for future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isOverdue(tomorrow.toISOString())).toBe(false);
    });
  });

  describe('isUpcoming', () => {
    it('should return true for future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isUpcoming(tomorrow.toISOString())).toBe(true);
    });

    it('should return false for today', () => {
      const today = new Date();
      expect(isUpcoming(today.toISOString())).toBe(false);
    });

    it('should return false for past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isUpcoming(yesterday.toISOString())).toBe(false);
    });
  });

  describe('getRelativeDateLabel', () => {
    it('should return "เลยกำหนด" for overdue dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(getRelativeDateLabel(yesterday.toISOString())).toBe('เลยกำหนด');
    });

    it('should return "วันนี้" for today', () => {
      const today = new Date();
      expect(getRelativeDateLabel(today.toISOString())).toBe('วันนี้');
    });

    it('should return "อีก X วัน" for future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(getRelativeDateLabel(tomorrow.toISOString())).toBe('อีก 1 วัน');

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      expect(getRelativeDateLabel(nextWeek.toISOString())).toBe('อีก 7 วัน');
    });
  });

  describe('formatDateThai', () => {
    it('should format date in Thai format', () => {
      const date = '2024-12-09';
      expect(formatDateThai(date)).toBe('9/12/2567');
    });

    it('should handle different date formats', () => {
      const date = '2024-01-01';
      expect(formatDateThai(date)).toBe('1/1/2567');
    });

    it('should handle invalid dates gracefully', () => {
      expect(() => formatDateThai('invalid-date')).not.toThrow();
    });
  });

  describe('groupActivitiesByDate', () => {
    it('should group activities by relative date status', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const today = new Date();

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const activities = [
        { id: '1', followUpDate: yesterday.toISOString().split('T')[0] },
        { id: '2', followUpDate: today.toISOString().split('T')[0] },
        { id: '3', followUpDate: tomorrow.toISOString().split('T')[0] },
      ] as unknown as Log[];

      const grouped = groupActivitiesByDate(activities);

      expect(grouped.overdue).toHaveLength(1);
      expect(grouped.today).toHaveLength(1);
      expect(grouped.upcoming).toHaveLength(1);
      expect(grouped.overdue[0].id).toBe('1');
      expect(grouped.today[0].id).toBe('2');
      expect(grouped.upcoming[0].id).toBe('3');
    });

    it('should handle empty array', () => {
      const grouped = groupActivitiesByDate([]);
      expect(grouped.overdue).toHaveLength(0);
      expect(grouped.today).toHaveLength(0);
      expect(grouped.upcoming).toHaveLength(0);
    });

    it('should filter activities without followUpDate', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const activities = [
        { id: '1', followUpDate: undefined },
        { id: '2', followUpDate: null },
        { id: '3', followUpDate: futureDate.toISOString().split('T')[0] },
      ] as unknown as Log[];

      const grouped = groupActivitiesByDate(activities);
      expect(grouped.overdue).toHaveLength(0);
      expect(grouped.today).toHaveLength(0);
      expect(grouped.upcoming).toHaveLength(1);
      expect(grouped.upcoming[0].id).toBe('3');
    });
  });
});