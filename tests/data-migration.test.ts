/**
 * Tests for Data Migration from Legacy Types (Issue #27)
 *
 * RED PHASE: These tests should FAIL initially because we haven't
 * implemented the full migration system yet
 */

import { describe, it, expect } from 'vitest'
import {
  validateMigration,
  validateFormulaMigration,
  migrateComponent,
  migrateFormula,
  createRollbackData,
  ensureStandardTypes,
  validateFormulaTypes,
  findFormulasNeedingMigration,
  migrateFormulaInDB,
  migrateAllFormulas,
  rollbackFormulaMigration,
  type MixingFormula,
  type MixingFormulaComponent
} from '@/lib/services/chemical-migration-service'

describe('Chemical Formulation Data Migration', () => {
  describe('Type Migration Validation', () => {
    it('should validate legacy type migrations correctly', () => {
      // Valid migrations
      expect(validateMigration('chelator', 'SC')).toBe(true)
      expect(validateMigration('suspended', 'WP')).toBe(true)
      expect(validateMigration('liquid', 'SL')).toBe(true)
      expect(validateMigration('fertilizer', 'FERT')).toBe(true)
      expect(validateMigration('adjuvant', 'SURF')).toBe(true)
      expect(validateMigration('oil_concentrate', 'EC')).toBe(true)
      expect(validateMigration('oil', 'ME')).toBe(true)

      // Invalid migrations - non-legacy old type
      expect(validateMigration('WP', 'SC')).toBe(false)
      expect(validateMigration('invalid', 'SC')).toBe(false)
      expect(validateMigration('chelator', 'INVALID')).toBe(false)
    })

    it('should identify formulas that need migration', () => {
      const formulaWithLegacy: MixingFormula = {
        id: 'test-1',
        orchardId: 'orchard-1',
        name: 'Test Formula',
        components: [
          { name: 'EDTA', type: 'chelator', quantity: 100, unit: 'g' },
          { name: 'ยาแขวนลอย', type: 'suspended', quantity: 200, unit: 'g' }
        ]
      }

      const formulaWithNewTypes: MixingFormula = {
        id: 'test-2',
        orchardId: 'orchard-1',
        name: 'Modern Formula',
        components: [
          { name: 'EDTA', type: 'SC', quantity: 100, unit: 'g' },
          { name: 'ยาแขวนลอย', type: 'WP', quantity: 200, unit: 'g' }
        ]
      }

      const validation1 = validateFormulaMigration(formulaWithLegacy)
      expect(validation1.canMigrate).toBe(true)
      expect(validation1.unmigratable).toHaveLength(0)

      const validation2 = validateFormulaMigration(formulaWithNewTypes)
      expect(validation2.canMigrate).toBe(true)
      expect(validation2.unmigratable).toHaveLength(0)
    })
  })

  describe('Database Migration', () => {
    it('should find formulas needing migration from database', async () => {
      // This should fail because the function is not implemented yet
      const formulas = await findFormulasNeedingMigration()
      expect(formulas).toBeDefined()
    })

    it('should migrate mixing formulas safely', () => {
      const testFormula: MixingFormula = {
        id: 'formula-1',
        orchardId: 'orchard-1',
        name: 'สูตรเก่า',
        components: [
          { name: 'EDTA', type: 'chelator', quantity: 100, unit: 'g' },
          { name: 'ยาแขวนลอย', type: 'suspended', quantity: 200, unit: 'g' },
          { name: 'ยาน้ำ', type: 'liquid', quantity: 150, unit: 'ml' },
          { name: 'ปุ๋ย', type: 'fertilizer', quantity: 500, unit: 'g' }
        ]
      }

      const migratedFormula = migrateFormula(testFormula)

      // Verify migration worked correctly
      expect(migratedFormula.components[0].type).toBe('SC')  // chelator -> SC
      expect(migratedFormula.components[1].type).toBe('WP')  // suspended -> WP
      expect(migratedFormula.components[2].type).toBe('SL')  // liquid -> SL
      expect(migratedFormula.components[3].type).toBe('FERT') // fertilizer -> FERT

      // Verify audit trail
      expect(migratedFormula.components[0]._originalType).toBe('chelator')
      expect(migratedFormula.components[1]._originalType).toBe('suspended')

      // Verify other properties unchanged
      expect(migratedFormula.name).toBe('สูตรเก่า')
      expect(migratedFormula.components[0].name).toBe('EDTA')
      expect(migratedFormula.components[0].quantity).toBe(100)
    })

    it('should migrate individual components correctly', () => {
      const legacyComponent: MixingFormulaComponent = {
        name: 'ยาเก่า',
        type: 'chelator',
        quantity: 100,
        unit: 'g'
      }

      const migratedComponent = migrateComponent(legacyComponent)
      expect(migratedComponent.type).toBe('SC')
      expect(migratedComponent._originalType).toBe('chelator')
      expect(migratedComponent.name).toBe('ยาเก่า')

      // New type component should remain unchanged
      const newComponent: MixingFormulaComponent = {
        name: 'ยาใหม่',
        type: 'SC',
        quantity: 100,
        unit: 'g'
      }

      const unchangedComponent = migrateComponent(newComponent)
      expect(unchangedComponent.type).toBe('SC')
      expect(unchangedComponent._originalType).toBeUndefined()
    })

    it('should create rollback data correctly', () => {
      const testFormula: MixingFormula = {
        id: 'test-1',
        orchardId: 'orchard-1',
        name: 'Test',
        components: [
          { name: 'Test', type: 'SC', _originalType: 'chelator', quantity: 100, unit: 'g' }
        ]
      }

      const rollbackData = createRollbackData(testFormula)
      expect(rollbackData.id).toBe('test-1')
      expect(rollbackData.originalComponents[0].type).toBe('SC')
      expect(rollbackData.originalComponents[0].originalType).toBe('chelator')
    })

    it('should fail migration for formulas with unmigratable types', () => {
      const invalidFormula: MixingFormula = {
        id: 'invalid-1',
        orchardId: 'orchard-1',
        name: 'Invalid Formula',
        components: [
          { name: 'Unknown', type: 'unknown_type', quantity: 100, unit: 'g' }
        ]
      }

      expect(() => migrateFormula(invalidFormula)).toThrow()
    })
  })

  describe('Backward Compatibility', () => {
    it('should validate both legacy and new types', () => {
      const formulaWithLegacyTypes: MixingFormula = {
        id: 'test-1',
        orchardId: 'orchard-1',
        name: 'Legacy Formula',
        components: [
          { name: 'EDTA', type: 'chelator', quantity: 100, unit: 'g' },
          { name: 'ยา', type: 'WP', quantity: 200, unit: 'g' }
        ]
      }

      const formulaWithNewTypes: MixingFormula = {
        id: 'test-2',
        orchardId: 'orchard-1',
        name: 'New Formula',
        components: [
          { name: 'EDTA', type: 'SC', quantity: 100, unit: 'g' },
          { name: 'ยา', type: 'SP', quantity: 200, unit: 'g' }
        ]
      }

      // Should accept both legacy and new types
      expect(validateFormulaTypes(formulaWithLegacyTypes)).toBe(true)
      expect(validateFormulaTypes(formulaWithNewTypes)).toBe(true)
    })

    it('should auto-migrate formulas with legacy types', () => {
      const formulaWithLegacyTypes: MixingFormula = {
        id: 'test-1',
        orchardId: 'orchard-1',
        name: 'สูตรเก่า',
        components: [
          { name: 'EDTA', type: 'chelator', quantity: 100, unit: 'g' },
          { name: 'ยา WP', type: 'suspended', quantity: 200, unit: 'g' },
          { name: 'ยาน้ำ', type: 'SL', quantity: 150, unit: 'ml' } // Already new type
        ]
      }

      const standardized = ensureStandardTypes(formulaWithLegacyTypes)

      // Should migrate legacy types but keep new types unchanged
      expect(standardized.components[0].type).toBe('SC') // chelator -> SC
      expect(standardized.components[1].type).toBe('WP') // suspended -> WP
      expect(standardized.components[2].type).toBe('SL') // Already SL, unchanged

      // Should preserve audit trail
      expect(standardized.components[0]._originalType).toBe('chelator')
      expect(standardized.components[1]._originalType).toBe('suspended')
      expect(standardized.components[2]._originalType).toBeUndefined()
    })

    it('should leave formulas with new types unchanged', () => {
      const formulaWithNewTypes: MixingFormula = {
        id: 'test-2',
        orchardId: 'orchard-1',
        name: 'สูตรใหม่',
        components: [
          { name: 'EDTA', type: 'SC', quantity: 100, unit: 'g' },
          { name: 'ยา', type: 'SP', quantity: 200, unit: 'g' }
        ]
      }

      const result = ensureStandardTypes(formulaWithNewTypes)

      // Should remain unchanged
      expect(result.components[0].type).toBe('SC')
      expect(result.components[1].type).toBe('SP')
      expect(result.components[0]._originalType).toBeUndefined()
    })
  })

  describe('Migration Safety', () => {
    it('should validate migration mapping correctness', () => {
      // Valid migrations
      expect(validateMigration('chelator', 'SC')).toBe(true)
      expect(validateMigration('suspended', 'WP')).toBe(true)
      expect(validateMigration('liquid', 'SL')).toBe(true)

      // Invalid migrations - wrong target type
      expect(validateMigration('chelator', 'WP')).toBe(false)
      expect(validateMigration('suspended', 'SL')).toBe(false)

      // Invalid migrations - non-legacy source
      expect(validateMigration('WP', 'SC')).toBe(false)
      expect(validateMigration('invalid', 'SC')).toBe(false)
    })

    it('should preserve data integrity during migration', () => {
      const testFormula: MixingFormula = {
        id: 'test-1',
        orchardId: 'orchard-1',
        name: 'Test Formula',
        components: [
          { name: 'Chem 1', type: 'chelator', quantity: 100, unit: 'g' },
          { name: 'Chem 2', type: 'suspended', quantity: 200, unit: 'g' },
          { name: 'Chem 3', type: 'liquid', quantity: 150, unit: 'ml' }
        ]
      }

      const original = JSON.parse(JSON.stringify(testFormula))
      const migrated = migrateFormula(testFormula)

      // Check migration worked
      expect(migrated.components[0].type).toBe('SC')
      expect(migrated.components[0]._originalType).toBe('chelator')

      // Check integrity preserved
      expect(migrated.components.length).toBe(original.components.length)
      expect(migrated.components.every((c, i) => c.quantity === original.components[i].quantity)).toBe(true)
      expect(migrated.components.every((c, i) => c.name === original.components[i].name)).toBe(true)
      expect(migrated.components.every((c, i) => c.unit === original.components[i].unit)).toBe(true)
    })

    it('should handle formulas with mixed legacy and new types', () => {
      const mixedFormula: MixingFormula = {
        id: 'mixed-1',
        orchardId: 'orchard-1',
        name: 'Mixed Formula',
        components: [
          { name: 'Legacy', type: 'chelator', quantity: 100, unit: 'g' },
          { name: 'New', type: 'SC', quantity: 200, unit: 'g' },
          { name: 'Another Legacy', type: 'fertilizer', quantity: 300, unit: 'g' }
        ]
      }

      const migrated = migrateFormula(mixedFormula)

      // Legacy types should be migrated
      expect(migrated.components[0].type).toBe('SC')
      expect(migrated.components[0]._originalType).toBe('chelator')
      expect(migrated.components[2].type).toBe('FERT')
      expect(migrated.components[2]._originalType).toBe('fertilizer')

      // New types should remain unchanged
      expect(migrated.components[1].type).toBe('SC')
      expect(migrated.components[1]._originalType).toBeUndefined()
    })
  })

  describe('Database Operations', () => {
    it('should successfully find formulas needing migration', async () => {
      // This should work now that the function is implemented
      const formulas = await findFormulasNeedingMigration()
      expect(Array.isArray(formulas)).toBe(true)
      // Should return an array (may be empty if no formulas need migration)
    })

    it('should fail when migrating non-existent formula in database', async () => {
      // This should fail because formula doesn't exist
      const result = await migrateFormulaInDB('non-existent-id')
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.duration).toBeGreaterThanOrEqual(0)
    })

    it('should successfully migrate all formulas (even if none need migration)', async () => {
      // This should work now that the function is implemented
      const result = await migrateAllFormulas()
      expect(result).toBeDefined()
      expect(typeof result.success).toBe('boolean')
      expect(typeof result.duration).toBe('number')
      expect(Array.isArray(result.errors)).toBe(true)
      expect(Array.isArray(result.warnings)).toBe(true)
      expect(Array.isArray(result.logs)).toBe(true)
    }, 10000) // Increase timeout to 10 seconds

    it('should indicate rollback functionality is not fully implemented', async () => {
      // This should work but indicate that rollback is not fully implemented
      const result = await rollbackFormulaMigration('test-id')
      expect(result.success).toBe(false)
      expect(result.errors.some(e => e.includes('not fully implemented'))).toBe(true)
      expect(result.warnings.some(w => w.includes('audit trail'))).toBe(true)
    })
  })
})