import { describe, it, expect } from 'vitest';
import {
  convertUIStatusToDB,
  convertDBStatusToUI,
  isValidUIStatus,
  isValidDBStatus,
  normalizeStatus
} from '@/lib/domain/status-utils';
import { TreeStatus } from '@prisma/client';

describe('Status Utils', () => {
  describe('convertUIStatusToDB', () => {
    it('should convert lowercase to uppercase', () => {
      expect(convertUIStatusToDB('healthy')).toBe('HEALTHY');
      expect(convertUIStatusToDB('sick')).toBe('SICK');
      expect(convertUIStatusToDB('dead')).toBe('DEAD');
      expect(convertUIStatusToDB('archived')).toBe('ARCHIVED');
    });

    it('should handle mixed case input', () => {
      expect(convertUIStatusToDB('Healthy')).toBe('HEALTHY');
      expect(convertUIStatusToDB('SICK')).toBe('SICK');
      expect(convertUIStatusToDB('dead')).toBe('DEAD');
    });

    it('should return undefined for null/undefined', () => {
      expect(convertUIStatusToDB(null)).toBeUndefined();
      expect(convertUIStatusToDB(undefined)).toBeUndefined();
      expect(convertUIStatusToDB('')).toBeUndefined();
    });

    it('should return undefined for invalid status', () => {
      expect(convertUIStatusToDB('invalid')).toBeUndefined();
      expect(convertUIStatusToDB('unknown')).toBeUndefined();
    });
  });

  describe('convertDBStatusToUI', () => {
    it('should convert uppercase to lowercase', () => {
      expect(convertDBStatusToUI('HEALTHY' as TreeStatus)).toBe('healthy');
      expect(convertDBStatusToUI('SICK' as TreeStatus)).toBe('sick');
      expect(convertDBStatusToUI('DEAD' as TreeStatus)).toBe('dead');
      expect(convertDBStatusToUI('ARCHIVED' as TreeStatus)).toBe('archived');
    });
  });

  describe('isValidUIStatus', () => {
    it('should validate UI status correctly', () => {
      expect(isValidUIStatus('healthy')).toBe(true);
      expect(isValidUIStatus('sick')).toBe(true);
      expect(isValidUIStatus('dead')).toBe(true);
      expect(isValidUIStatus('archived')).toBe(true);

      expect(isValidUIStatus('HEALTHY')).toBe(false);
      expect(isValidUIStatus('')).toBe(false);
      expect(isValidUIStatus('invalid')).toBe(false);
    });
  });

  describe('isValidDBStatus', () => {
    it('should validate DB status correctly', () => {
      expect(isValidDBStatus('HEALTHY')).toBe(true);
      expect(isValidDBStatus('SICK')).toBe(true);
      expect(isValidDBStatus('DEAD')).toBe(true);
      expect(isValidDBStatus('ARCHIVED')).toBe(true);

      expect(isValidDBStatus('healthy')).toBe(false);
      expect(isValidDBStatus('')).toBe(false);
      expect(isValidDBStatus('INVALID')).toBe(false);
    });
  });

  describe('normalizeStatus', () => {
    it('should normalize various status formats', () => {
      expect(normalizeStatus('healthy')).toBe('HEALTHY');
      expect(normalizeStatus('HEALTHY')).toBe('HEALTHY');
      expect(normalizeStatus('Healthy')).toBe('HEALTHY');
    });

    it('should handle null/undefined', () => {
      expect(normalizeStatus(null)).toBeUndefined();
      expect(normalizeStatus(undefined)).toBeUndefined();
      expect(normalizeStatus('')).toBeUndefined();
    });

    it('should return undefined for invalid status', () => {
      expect(normalizeStatus('invalid')).toBeUndefined();
    });
  });

  describe('Round-trip conversion', () => {
    it('should maintain consistency', () => {
      const uiStatuses = ['healthy', 'sick', 'dead', 'archived'] as const;

      uiStatuses.forEach(status => {
        const dbStatus = convertUIStatusToDB(status);
        const convertedBack = convertDBStatusToUI(dbStatus!);
        expect(convertedBack).toBe(status);
      });
    });
  });
});