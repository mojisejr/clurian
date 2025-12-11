import { describe, it, expect } from 'vitest';
import { TreeStatus } from '@prisma/client';
import { treeStatusFromUI, treeStatusToUI, isValidUIStatus, isValidTreeStatus } from '@/lib/domain/mappers';
import { validateTreeStatus, validateUIStatus } from '@/lib/domain/validation';
import { getTreeStatusDisplay, getUIStatusOptions } from '@/lib/domain/status-display';

// GREEN phase - These tests should PASS with the implemented functions

describe('TreeStatus Enum Handling', () => {
  it('should handle status mapping from UI to database', () => {
    // Convert from UI (lowercase) to Database (uppercase)
    expect(treeStatusFromUI('healthy')).toBe('HEALTHY');
    expect(treeStatusFromUI('sick')).toBe('SICK');
    expect(treeStatusFromUI('dead')).toBe('DEAD');
    expect(treeStatusFromUI('archived')).toBe('ARCHIVED');

    // Convert from Database (uppercase) to UI (lowercase)
    expect(treeStatusToUI('HEALTHY' as TreeStatus)).toBe('healthy');
    expect(treeStatusToUI('SICK' as TreeStatus)).toBe('sick');
    expect(treeStatusToUI('DEAD' as TreeStatus)).toBe('dead');
    expect(treeStatusToUI('ARCHIVED' as TreeStatus)).toBe('archived');
  });

  it('should validate TreeStatus values', () => {
    // Valid values should pass
    expect(validateTreeStatus('HEALTHY')).toBe(true);
    expect(validateTreeStatus('SICK')).toBe(true);
    expect(validateTreeStatus('DEAD')).toBe(true);
    expect(validateTreeStatus('ARCHIVED')).toBe(true);

    // Invalid values should fail
    expect(validateTreeStatus('healthy')).toBe(false);
    expect(validateTreeStatus('invalid')).toBe(false);
    expect(validateTreeStatus('')).toBe(false);
  });

  it('should validate UI status values', () => {
    // Valid values should pass
    expect(validateUIStatus('healthy')).toBe(true);
    expect(validateUIStatus('sick')).toBe(true);
    expect(validateUIStatus('dead')).toBe(true);
    expect(validateUIStatus('archived')).toBe(true);

    // Invalid values should fail
    expect(validateUIStatus('HEALTHY')).toBe(false);
    expect(validateUIStatus('invalid')).toBe(false);
    expect(validateUIStatus('')).toBe(false);
  });

  it('should display status in Thai', () => {
    // Both uppercase and lowercase should work
    expect(getTreeStatusDisplay('HEALTHY' as TreeStatus)).toBe('ปกติ');
    expect(getTreeStatusDisplay('SICK' as TreeStatus)).toBe('ป่วย/ดูแล');
    expect(getTreeStatusDisplay('DEAD' as TreeStatus)).toBe('ตาย');
    expect(getTreeStatusDisplay('ARCHIVED' as TreeStatus)).toBe('เลิกทำ');

    expect(getTreeStatusDisplay('healthy')).toBe('ปกติ');
    expect(getTreeStatusDisplay('sick')).toBe('ป่วย/ดูแล');
    expect(getTreeStatusDisplay('dead')).toBe('ตาย');
    expect(getTreeStatusDisplay('archived')).toBe('เลิกทำ');
  });

  it('should provide UI status options', () => {
    const options = getUIStatusOptions();
    expect(options).toHaveLength(4);
    expect(options[0]).toEqual({ value: 'healthy', label: 'ปกติ' });
    expect(options[1]).toEqual({ value: 'sick', label: 'ป่วย/ดูแล' });
    expect(options[2]).toEqual({ value: 'dead', label: 'ตาย' });
    expect(options[3]).toEqual({ value: 'archived', label: 'เลิกทำ' });
  });
});

describe('TreeStatus Validation', () => {
  it('should check valid UI status', () => {
    expect(isValidUIStatus('healthy')).toBe(true);
    expect(isValidUIStatus('sick')).toBe(true);
    expect(isValidUIStatus('dead')).toBe(true);
    expect(isValidUIStatus('archived')).toBe(true);
    expect(isValidUIStatus('HEALTHY')).toBe(false);
  });

  it('should check valid TreeStatus', () => {
    expect(isValidTreeStatus('HEALTHY')).toBe(true);
    expect(isValidTreeStatus('SICK')).toBe(true);
    expect(isValidTreeStatus('DEAD')).toBe(true);
    expect(isValidTreeStatus('ARCHIVED')).toBe(true);
    expect(isValidTreeStatus('healthy')).toBe(false);
  });
});