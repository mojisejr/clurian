import { describe, it, expect } from 'vitest';
import {
  getStatusLabel,
  getStatusColor,
  getStatusOrder,
  getTreeStatusPriorityList,
  getStatusVariant,
  getStatusConfig
} from '@/lib/utils/status';

// Tests will fail initially (RED phase)
describe('Status Utilities', () => {
  describe('getStatusLabel', () => {
    it('should return Thai label for valid database status', () => {
      expect(getStatusLabel('HEALTHY')).toBe('ปกติ');
      expect(getStatusLabel('SICK')).toBe('ป่วย/ดูแล');
      expect(getStatusLabel('DEAD')).toBe('ตาย');
      expect(getStatusLabel('ARCHIVED')).toBe('เลิกทำ');
    });

    it('should return Thai label for valid UI status', () => {
      expect(getStatusLabel('healthy')).toBe('ปกติ');
      expect(getStatusLabel('sick')).toBe('ป่วย/ดูแล');
      expect(getStatusLabel('dead')).toBe('ตาย');
      expect(getStatusLabel('archived')).toBe('เลิกทำ');
    });

    it('should return original status for unknown status', () => {
      expect(getStatusLabel('UNKNOWN' as any)).toBe('UNKNOWN');
      expect(getStatusLabel('invalid' as any)).toBe('invalid');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color for each status', () => {
      expect(getStatusColor('HEALTHY')).toBe('green');
      expect(getStatusColor('healthy')).toBe('green');
      expect(getStatusColor('SICK')).toBe('orange');
      expect(getStatusColor('sick')).toBe('orange');
      expect(getStatusColor('DEAD')).toBe('red');
      expect(getStatusColor('dead')).toBe('red');
      expect(getStatusColor('ARCHIVED')).toBe('gray');
      expect(getStatusColor('archived')).toBe('gray');
    });

    it('should return gray for unknown status', () => {
      expect(getStatusColor('UNKNOWN' as any)).toBe('gray');
    });
  });

  describe('getStatusOrder', () => {
    it('should return correct sorting order for priority', () => {
      expect(getStatusOrder('SICK')).toBe(1);
      expect(getStatusOrder('sick')).toBe(1);
      expect(getStatusOrder('HEALTHY')).toBe(2);
      expect(getStatusOrder('healthy')).toBe(2);
      expect(getStatusOrder('DEAD')).toBe(3);
      expect(getStatusOrder('dead')).toBe(3);
      expect(getStatusOrder('ARCHIVED')).toBe(4);
      expect(getStatusOrder('archived')).toBe(4);
    });

    it('should return high number for unknown status', () => {
      expect(getStatusOrder('UNKNOWN' as any)).toBe(999);
    });
  });

  describe('getTreeStatusPriorityList', () => {
    it('should return statuses in priority order', () => {
      const priority = getTreeStatusPriorityList();
      expect(priority).toEqual(['SICK', 'HEALTHY', 'DEAD', 'ARCHIVED']);
    });

    it('should return array of strings', () => {
      const priority = getTreeStatusPriorityList();
      expect(Array.isArray(priority)).toBe(true);
      expect(priority.length).toBe(4);
    });
  });

  describe('getStatusVariant', () => {
    it('should return correct variant for badge components', () => {
      expect(getStatusVariant('HEALTHY')).toBe('secondary');
      expect(getStatusVariant('SICK')).toBe('accent');
      expect(getStatusVariant('DEAD')).toBe('destructive');
      expect(getStatusVariant('ARCHIVED')).toBe('muted');
    });

    it('should handle UI status as well', () => {
      expect(getStatusVariant('healthy')).toBe('secondary');
      expect(getStatusVariant('sick')).toBe('accent');
    });

    it('should return muted for unknown status', () => {
      expect(getStatusVariant('UNKNOWN' as any)).toBe('muted');
    });
  });

  describe('getStatusConfig', () => {
    it('should return complete configuration object', () => {
      const config = getStatusConfig('HEALTHY');
      expect(config).toEqual({
        label: 'ปกติ',
        color: 'green',
        variant: 'secondary',
        order: 2
      });
    });

    it('should return config for UI status', () => {
      const config = getStatusConfig('sick');
      expect(config).toEqual({
        label: 'ป่วย/ดูแล',
        color: 'orange',
        variant: 'accent',
        order: 1
      });
    });

    it('should return default config for unknown status', () => {
      const config = getStatusConfig('UNKNOWN' as any);
      expect(config).toEqual({
        label: 'UNKNOWN',
        color: 'gray',
        variant: 'muted',
        order: 999
      });
    });
  });
});