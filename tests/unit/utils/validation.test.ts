import { describe, it, expect } from 'vitest';
import {
  validateTreeCode,
  validateOrchardName,
  validateTreeVariety,
  validateRequiredString,
  validateEmail,
  validatePhoneNumber,
  validateZone,
  validateChemicalFormula,
  validatePaginationParams,
  validateLogAction
} from '@/lib/utils/validation';

// Tests will fail initially (RED phase)
describe('Validation Utilities', () => {
  describe('validateTreeCode', () => {
    it('should accept valid tree code format', () => {
      expect(validateTreeCode('T001')).toBe(true);
      expect(validateTreeCode('A123')).toBe(true);
      expect(validateTreeCode('M99')).toBe(true);
      expect(validateTreeCode('TREE001')).toBe(true);
      expect(validateTreeCode('t001')).toBe(true); // case insensitive
    });

    it('should reject invalid tree code', () => {
      expect(validateTreeCode('')).toBe(false);
      expect(validateTreeCode('T')).toBe(false);
      expect(validateTreeCode('001')).toBe(false); // no letters
      expect(validateTreeCode('TOOLONG')).toBe(false); // no numbers
      expect(validateTreeCode('T1')).toBe(false); // number too short
      expect(validateTreeCode('T00123')).toBe(false); // number too long
      expect(validateTreeCode('T00A')).toBe(false); // contains non-digit
    });

    it('should handle edge cases', () => {
      expect(validateTreeCode('A001')).toBe(true);
      expect(validateTreeCode('ZZZZ999')).toBe(true);
      expect(validateTreeCode(null as any)).toBe(false);
      expect(validateTreeCode(undefined as any)).toBe(false);
    });
  });

  describe('validateOrchardName', () => {
    it('should accept valid orchard name', () => {
      expect(validateOrchardName('สวนทุเรียนหมอนทอง')).toBe(true);
      expect(validateOrchardName('My Orchard')).toBe(true);
      expect(validateOrchardName('A')).toBe(true); // minimum length
      expect(validateOrchardName('a'.repeat(100))).toBe(true); // maximum length
    });

    it('should reject invalid orchard name', () => {
      expect(validateOrchardName('')).toBe(false);
      expect(validateOrchardName('   ')).toBe(false); // whitespace only
      expect(validateOrchardName('a'.repeat(101))).toBe(false); // too long
      expect(validateOrchardName(null as any)).toBe(false);
      expect(validateOrchardName(undefined as any)).toBe(false);
    });

    it('should trim whitespace', () => {
      expect(validateOrchardName('  Test Orchard  ')).toBe(true);
    });
  });

  describe('validateTreeVariety', () => {
    it('should accept valid durian varieties', () => {
      expect(validateTreeVariety('หมอนทอง')).toBe(true);
      expect(validateTreeVariety('ก้านยาว')).toBe(true);
      expect(validateTreeVariety('ชะนี')).toBe(true);
      expect(validateTreeVariety('พวงมณี')).toBe(true);
      expect(validateTreeVariety('นกหยิบ')).toBe(true);
      expect(validateTreeVariety('กระดุม')).toBe(true);
      expect(validateTreeVariety('หลงลับแล')).toBe(true);
      expect(validateTreeVariety('chanee')).toBe(true); // case insensitive
    });

    it('should reject invalid varieties', () => {
      expect(validateTreeVariety('')).toBe(false);
      expect(validateTreeVariety('invalid')).toBe(false);
      expect(validateTreeVariety('Apple')).toBe(false);
      expect(validateTreeVariety(null as any)).toBe(false);
    });
  });

  describe('validateRequiredString', () => {
    it('should validate non-empty strings', () => {
      expect(validateRequiredString('test')).toBe(true);
      expect(validateRequiredString('a')).toBe(true);
    });

    it('should reject empty or invalid strings', () => {
      expect(validateRequiredString('')).toBe(false);
      expect(validateRequiredString('   ')).toBe(false);
      expect(validateRequiredString(null as any)).toBe(false);
      expect(validateRequiredString(undefined as any)).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should accept valid email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.th')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('test.example.com')).toBe(false);
    });
  });

  describe('validatePhoneNumber', () => {
    it('should accept Thai phone number formats', () => {
      expect(validatePhoneNumber('0123456789')).toBe(true);
      expect(validatePhoneNumber('+66123456789')).toBe(true);
      expect(validatePhoneNumber('099-999-9999')).toBe(true);
      expect(validatePhoneNumber('081 234 5678')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('')).toBe(false);
      expect(validatePhoneNumber('123')).toBe(false);
      expect(validatePhoneNumber('abcdefghij')).toBe(false);
      expect(validatePhoneNumber('+123456789012345')).toBe(false); // too long
    });
  });

  describe('validateZone', () => {
    it('should accept valid zone formats', () => {
      expect(validateZone('A')).toBe(true);
      expect(validateZone('B')).toBe(true);
      expect(validateZone('Zone A')).toBe(true);
      expect(validateZone('Zone 1')).toBe(true);
      expect(validateZone('โซน A')).toBe(true);
      expect(validateZone('1')).toBe(true);
    });

    it('should reject invalid zone values', () => {
      expect(validateZone('')).toBe(false);
      expect(validateZone('   ')).toBe(false);
      expect(validateZone(null as any)).toBe(false);
    });
  });

  describe('validateChemicalFormula', () => {
    it('should accept valid fertilizer formulas', () => {
      expect(validateChemicalFormula('15-15-15')).toBe(true);
      expect(validateChemicalFormula('16-16-16')).toBe(true);
      expect(validateChemicalFormula('46-0-0')).toBe(true);
      expect(validateChemicalFormula('0-0-60')).toBe(true);
      expect(validateChemicalFormula('8-24-24')).toBe(true);
      expect(validateChemicalFormula('13-13-21')).toBe(true);
    });

    it('should reject invalid formulas', () => {
      expect(validateChemicalFormula('')).toBe(false);
      expect(validateChemicalFormula('15-15')).toBe(false); // missing third number
      expect(validateChemicalFormula('15-15-15-15')).toBe(false); // too many numbers
      expect(validateChemicalFormula('15-abc-15')).toBe(false); // non-numeric
      expect(validateChemicalFormula('101-15-15')).toBe(false); // first number too high
    });
  });

  describe('validatePaginationParams', () => {
    it('should accept valid pagination parameters', () => {
      expect(validatePaginationParams({ page: 1, limit: 10 })).toEqual({ page: 1, limit: 10 });
      expect(validatePaginationParams({ page: 5, limit: 50 })).toEqual({ page: 5, limit: 50 });
      expect(validatePaginationParams({ page: 0, limit: 10 })).toEqual({ page: 1, limit: 10 }); // min page
      expect(validatePaginationParams({ page: -1, limit: 10 })).toEqual({ page: 1, limit: 10 }); // negative page
    });

    it('should handle parameter limits', () => {
      expect(validatePaginationParams({ page: 1, limit: 0 })).toEqual({ page: 1, limit: 1 }); // min limit
      expect(validatePaginationParams({ page: 1, limit: 101 })).toEqual({ page: 1, limit: 100 }); // max limit
    });

    it('should reject invalid parameters', () => {
      expect(() => validatePaginationParams({ page: NaN, limit: 10 })).toThrow();
      expect(() => validatePaginationParams({ page: 1, limit: NaN })).toThrow();
      expect(() => validatePaginationParams({ page: 'abc' as any, limit: 10 })).toThrow();
      expect(() => validatePaginationParams({ page: {}, limit: 10 })).toThrow();
    });
  });

  describe('validateLogAction', () => {
    it('should accept valid log actions', () => {
      expect(validateLogAction('ใส่ปุ๋ย')).toBe(true);
      expect(validateLogAction('พ่นยา/ฮอร์โมน')).toBe(true);
      expect(validateLogAction('ตัดแต่งกิ่ง')).toBe(true);
      expect(validateLogAction('รักษาโรค/ทายา')).toBe(true);
      expect(validateLogAction('ให้น้ำ')).toBe(true);
      expect(validateLogAction('ตรวจสอบสภาพ')).toBe(true);
      expect(validateLogAction('เก็บเกี่ยว')).toBe(true);
    });

    it('should reject invalid log actions', () => {
      expect(validateLogAction('')).toBe(false);
      expect(validateLogAction('invalid action')).toBe(false);
      expect(validateLogAction('watering')).toBe(false); // not in Thai
      expect(validateLogAction(null as any)).toBe(false);
    });
  });
});