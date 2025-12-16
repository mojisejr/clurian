import { describe, it, expect } from 'vitest';
import {
  treeStatusToUI,
  treeStatusFromUI,
  isValidUIStatus,
  isValidTreeStatus
} from '@/lib/domain/mappers';
import { TreeStatus } from '@prisma/client';

describe('Tree Status Conversion', () => {
  describe('treeStatusFromUI', () => {
    it('should convert lowercase UI status to uppercase DB status', () => {
      expect(treeStatusFromUI('healthy')).toBe('HEALTHY');
      expect(treeStatusFromUI('sick')).toBe('SICK');
      expect(treeStatusFromUI('dead')).toBe('DEAD');
      expect(treeStatusFromUI('archived')).toBe('ARCHIVED');
    });

    it('should handle mixed case input', () => {
      expect(treeStatusFromUI('Healthy')).toBe('HEALTHY');
      expect(treeStatusFromUI('SICK')).toBe('SICK');
      expect(treeStatusFromUI('dead')).toBe('DEAD');
      expect(treeStatusFromUI('ARCHIVED')).toBe('ARCHIVED');
    });
  });

  describe('treeStatusToUI', () => {
    it('should convert uppercase DB status to lowercase UI status', () => {
      expect(treeStatusToUI('HEALTHY' as TreeStatus)).toBe('healthy');
      expect(treeStatusToUI('SICK' as TreeStatus)).toBe('sick');
      expect(treeStatusToUI('DEAD' as TreeStatus)).toBe('dead');
      expect(treeStatusToUI('ARCHIVED' as TreeStatus)).toBe('archived');
    });
  });

  describe('isValidUIStatus', () => {
    it('should validate UI status strings correctly', () => {
      expect(isValidUIStatus('healthy')).toBe(true);
      expect(isValidUIStatus('sick')).toBe(true);
      expect(isValidUIStatus('dead')).toBe(true);
      expect(isValidUIStatus('archived')).toBe(true);

      expect(isValidUIStatus('HEALTHY')).toBe(false);
      expect(isValidUIStatus('invalid')).toBe(false);
      expect(isValidUIStatus('')).toBe(false);
    });
  });

  describe('isValidTreeStatus', () => {
    it('should validate TreeStatus strings correctly', () => {
      expect(isValidTreeStatus('HEALTHY')).toBe(true);
      expect(isValidTreeStatus('SICK')).toBe(true);
      expect(isValidTreeStatus('DEAD')).toBe(true);
      expect(isValidTreeStatus('ARCHIVED')).toBe(true);

      expect(isValidTreeStatus('healthy')).toBe(false);
      expect(isValidTreeStatus('invalid')).toBe(false);
      expect(isValidTreeStatus('')).toBe(false);
    });
  });

  describe('Round-trip conversion', () => {
    it('should maintain consistency through full conversion cycle', () => {
      const uiStatuses = ['healthy', 'sick', 'dead', 'archived'] as const;

      uiStatuses.forEach(status => {
        const dbStatus = treeStatusFromUI(status);
        const convertedBack = treeStatusToUI(dbStatus);
        expect(convertedBack).toBe(status);
      });
    });
  });
});