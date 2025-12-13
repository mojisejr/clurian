/**
 * Tests for Chemical Formulations Constants (Issue #27)
 *
 * RED PHASE: These tests should FAIL initially because we only have 20 types
 * After implementation, we should have 46 types following FAO/CIPAC standards
 */

import { describe, it, expect, test } from 'vitest'
import {
  CHEMICAL_FORMULATIONS,
  ChemicalFormulation,
  POWDER_FORMULATIONS,
  LIQUID_FORMULATIONS,
  SPECIAL_FORMULATIONS,
  FERTILIZER_FORMULATIONS,
  ADJUVANT_FORMULATIONS,
  ADDITIONAL_FORMULATIONS,
  TYPE_MIGRATION_MAP,
  isOldChemicalType,
  migrateChemicalType,
  getFormulationCategory
} from '@/constants/chemical-formulations'

describe('CHEMICAL_FORMULATIONS Constants', () => {
  describe('Complete Formulation Coverage (46 types)', () => {
    it('should have all 46 formulation types', () => {
      const formulations = Object.keys(CHEMICAL_FORMULATIONS)
      expect(formulations).toHaveLength(46)

      // Check for all critical types mentioned in Issue #27
      const criticalTypes = [
        // Original 20 types
        'WP', 'WDG', 'GR', 'DF', 'FDF',
        'EC', 'SC', 'SL', 'EW', 'ME',
        'CS', 'WG', 'FS', 'SE',
        'FERT', 'ORG', 'LIQ_FERT',
        'SURF', 'STICK', 'SPREAD',
        // New critical types for Thai agriculture
        'SP', 'SG', 'PA', 'OD', 'ZC', 'UL', 'GE', 'GB',
        'MG', 'MT', 'RB', 'AC', 'AF', 'T', 'WS',
        // Additional international standards
        'WP-SC', 'EC-ME', 'SC-EC',
        // Added special types
        'MC', 'SG-S', 'EW-O', 'XL', 'WP-E',
        // Additional types
        'BR', 'FU', 'TO'
      ]

      criticalTypes.forEach(type => {
        expect(formulations).toContain(type)
      })
    })

    it('should have proper English descriptions for all types', () => {
      // Critical types with expected descriptions
      const expectedDescriptions = {
        'SP': 'Soluble Powder',
        'SG': 'Soluble Granule',
        'PA': 'Tree Paste',
        'OD': 'Oil Dispersion',
        'ZC': 'Zinc/Copper',
        'UL': 'Drone Formulation',
        'GE': 'Gas Generator',
        'GB': 'Granular Bait',
        'MG': 'Micro Granule',
        'MT': 'Micro Tablet',
        'RB': 'Ready Bait',
        'AC': 'Aqueous Capsule',
        'AF': 'Aqueous Flowable',
        'T': 'Tablet',
        'WS': 'Water Soluble',
        'WP-SC': 'Wettable Powder-Suspension Concentrate',
        'EC-ME': 'Emulsifiable Concentrate-Micro Emulsion',
        'SC-EC': 'Suspension Concentrate-Emulsifiable Concentrate'
      }

      Object.entries(expectedDescriptions).forEach(([type, description]) => {
        expect(CHEMICAL_FORMULATIONS[type as ChemicalFormulation]).toBe(description)
      })
    })
  })

  describe('Category Groups', () => {
    it('should properly categorize all 46 types', () => {
      const allFormulations = Object.keys(CHEMICAL_FORMULATIONS)
      const allCategorized = [
        ...POWDER_FORMULATIONS,
        ...LIQUID_FORMULATIONS,
        ...SPECIAL_FORMULATIONS,
        ...FERTILIZER_FORMULATIONS,
        ...ADJUVANT_FORMULATIONS,
        ...ADDITIONAL_FORMULATIONS
      ]

      // Should include all types (no duplicates)
      const uniqueCategorized = [...new Set(allCategorized)]
      expect(uniqueCategorized).toHaveLength(46)
      expect(allFormulations.sort()).toEqual(uniqueCategorized.sort())
    })

    it('should have expanded powder formulations (14 types)', () => {
      expect(POWDER_FORMULATIONS).toHaveLength(14)

      const expectedPowderTypes = [
        'WP', 'WDG', 'GR', 'DF', 'FDF', 'SP', 'SG', 'MG', 'MT',
        'WS', 'T', 'ZC', 'RB', 'GB'
      ]

      expectedPowderTypes.forEach(type => {
        expect(POWDER_FORMULATIONS).toContain(type)
      })
    })

    it('should have expanded liquid formulations (13 types)', () => {
      expect(LIQUID_FORMULATIONS).toHaveLength(13)

      const expectedLiquidTypes = [
        'EC', 'SC', 'SL', 'EW', 'ME', 'OD', 'AC', 'AF',
        'WP-SC', 'EC-ME', 'SC-EC', 'UL', 'GE'
      ]

      expectedLiquidTypes.forEach(type => {
        expect(LIQUID_FORMULATIONS).toContain(type)
      })
    })

    it('should have expanded special formulations (10 types)', () => {
      expect(SPECIAL_FORMULATIONS).toHaveLength(10)

      const expectedSpecialTypes = [
        'CS', 'WG', 'FS', 'SE', 'PA', 'MC', 'SG-S', 'EW-O',
        'XL', 'WP-E'
      ]

      expectedSpecialTypes.forEach(type => {
        expect(SPECIAL_FORMULATIONS).toContain(type)
      })
    })

    it('should maintain fertilizer and adjuvant categories', () => {
      expect(FERTILIZER_FORMULATIONS).toContain('FERT')
      expect(FERTILIZER_FORMULATIONS).toContain('ORG')
      expect(FERTILIZER_FORMULATIONS).toContain('LIQ_FERT')

      expect(ADJUVANT_FORMULATIONS).toContain('SURF')
      expect(ADJUVANT_FORMULATIONS).toContain('STICK')
      expect(ADJUVANT_FORMULATIONS).toContain('SPREAD')
    })
  })

  describe('Migration Support', () => {
    it('should maintain backward compatibility with legacy types', () => {
      const legacyTypes = ['chelator', 'suspended', 'liquid', 'fertilizer', 'adjuvant', 'oil_concentrate', 'oil']

      legacyTypes.forEach(type => {
        expect(isOldChemicalType(type)).toBe(true)
        expect(TYPE_MIGRATION_MAP[type as keyof typeof TYPE_MIGRATION_MAP]).toBeDefined()
      })
    })

    it('should migrate legacy types to appropriate new standards', () => {
      const expectedMigrations = {
        'chelator': 'SC',      // Now maps to Suspension Concentrate
        'suspended': 'WP',     // Wettable Powder
        'liquid': 'SL',        // Soluble Liquid
        'fertilizer': 'FERT',  // Chemical Fertilizer
        'adjuvant': 'SURF',    // Surfactant
        'oil_concentrate': 'EC', // Emulsifiable Concentrate
        'oil': 'ME'            // Micro Emulsion
      }

      Object.entries(expectedMigrations).forEach(([oldType, newType]) => {
        expect(migrateChemicalType(oldType as keyof typeof TYPE_MIGRATION_MAP)).toBe(newType)
      })
    })
  })

  describe('Category Detection', () => {
    it('should correctly identify categories for all types', () => {
      const testCases = [
        { type: 'WP', category: 'Powder' },
        { type: 'SP', category: 'Powder' },
        { type: 'SG', category: 'Powder' },
        { type: 'EC', category: 'Liquid' },
        { type: 'OD', category: 'Liquid' },
        { type: 'UL', category: 'Liquid' },
        { type: 'CS', category: 'Special' },
        { type: 'PA', category: 'Special' },
        { type: 'FERT', category: 'Fertilizer' },
        { type: 'ORG', category: 'Fertilizer' },
        { type: 'SURF', category: 'Adjuvant' },
        { type: 'STICK', category: 'Adjuvant' },
        { type: 'BR', category: 'Additional' },
        { type: 'FU', category: 'Additional' },
        { type: 'TO', category: 'Additional' }
      ]

      testCases.forEach(({ type, category }) => {
        expect(getFormulationCategory(type as ChemicalFormulation)).toBe(category)
      })
    })
  })

  describe('Type Safety', () => {
    it('should provide proper TypeScript types', () => {
      const testType: ChemicalFormulation = 'WP'
      expect(typeof testType).toBe('string')

      // Should compile without errors for new types
      const newType: ChemicalFormulation = 'SP'
      expect(typeof newType).toBe('string')
    })
  })
})

describe('FAO/CIPAC Compliance', () => {
  it('should follow international naming standards', () => {
    // All types should be 2-4 characters (except combinations with hyphens)
    const formulations = Object.keys(CHEMICAL_FORMULATIONS)

    formulations.forEach(formulation => {
      if (formulation.includes('-')) {
        // Combined formulations like WP-SC
        const parts = formulation.split('-')
        parts.forEach(part => {
          expect(part).toMatch(/^[A-Z]{2,4}$/)
        })
      } else if (formulation === 'LIQ_FERT') {
        // Special case for liquid fertilizer
        expect(formulation).toBe('LIQ_FERT')
      } else {
        expect(formulation).toMatch(/^[A-Z]{2,4}$/)
      }
    })
  })

  it('should include critical Thai agriculture formulations', () => {
    const criticalForThai = [
      'SP',    // Soluble Powder - critical for solubility
      'SG',    // Soluble Granule - modern granular tech
      'PA',    // Tree Paste - for trunk application
      'OD',    // Oil Dispersion - advanced oil formulation
      'ZC',    // Zinc/Copper - essential micronutrients
      'UL',    // Drone formulations - modern application
      'GE',    // Gas Generator - fumigation
      'GB'     // Granular Bait - pest control
    ]

    criticalForThai.forEach(type => {
      expect(CHEMICAL_FORMULATIONS).toHaveProperty(type)
    })
  })
})

describe('Quality Assurance', () => {
  it('should have no duplicate descriptions', () => {
    const descriptions = Object.values(CHEMICAL_FORMULATIONS)
    const uniqueDescriptions = [...new Set(descriptions)]

    expect(descriptions).toHaveLength(uniqueDescriptions.length)
  })

  it('should have meaningful descriptions for all types', () => {
    Object.entries(CHEMICAL_FORMULATIONS).forEach(([type, description]) => {
      expect(description).toBeTruthy()
      expect(description.length).toBeGreaterThan(5)
      expect(description).not.toBe(type) // Should not just repeat the code
    })
  })

  it('should be sorted logically within categories', () => {
    // Categories should be sorted by importance/usage frequency
    const checkOrder = (category: readonly string[]) => {
      const firstType = category[0]
      expect(['WP', 'EC', 'SC', 'CS', 'FERT', 'SURF']).toContain(firstType)
    }

    checkOrder(POWDER_FORMULATIONS)
    checkOrder(LIQUID_FORMULATIONS)
    checkOrder(SPECIAL_FORMULATIONS)
  })
})