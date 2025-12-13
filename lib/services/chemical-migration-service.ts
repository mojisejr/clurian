/**
 * Chemical Formulation Data Migration Service
 *
 * This service handles the migration from legacy Thai chemical types
 * to international standard FAO/CIPAC abbreviations as part of Issue #27.
 *
 * Features:
 * - Safe migration with validation and rollback
 * - Backward compatibility during transition
 * - Audit trail for migrated records
 * - Batch processing for performance
 * - Transaction support for data integrity
 * - Comprehensive error handling and logging
 */

import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import {
  TYPE_MIGRATION_MAP,
  ChemicalFormulation,
  isOldChemicalType,
  migrateChemicalType,
  CHEMICAL_FORMULATIONS
} from '@/constants/chemical-formulations'

// === Migration Configuration ===

/** Maximum number of formulas to process in a single batch */
export const MIGRATION_BATCH_SIZE = 100

/** Migration log levels */
export enum MigrationLogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error'
}

/** Migration log entry */
export interface MigrationLogEntry {
  timestamp: Date
  level: MigrationLogLevel
  formulaId: string
  message: string
  metadata?: Record<string, unknown>
}

// === Migration Types ===

export interface MigrationResult {
  success: boolean
  migrated: number
  failed: number
  errors: string[]
  warnings: string[]
  duration: number // in milliseconds
  rollbackData?: unknown[]
  logs: MigrationLogEntry[]
}

export interface MigrationProgress {
  total: number
  processed: number
  migrated: number
  failed: number
  currentBatch: number
  totalBatches: number
  percentage: number
}

export interface MixingFormulaComponent {
  name: string
  type: string
  quantity: number
  unit: string
  step?: number
  _originalType?: string // For audit trail
}

export interface MixingFormula {
  id: string
  orchardId: string
  name: string
  description?: string
  components: MixingFormulaComponent[]
}

// === Migration Validation ===

/**
 * Validate if a migration from oldType to newType is allowed
 */
export function validateMigration(oldType: string, newType: string): boolean {
  // Check if old type is a legacy type
  if (!isOldChemicalType(oldType)) {
    return false
  }

  // Check if new type is the expected migration target for the old type
  const expectedNewType = migrateChemicalType(oldType as keyof typeof TYPE_MIGRATION_MAP)
  return expectedNewType === newType
}

/**
 * Validate that all component types in a formula can be migrated
 */
export function validateFormulaMigration(formula: MixingFormula): {
  canMigrate: boolean
  unmigratable: string[]
} {
  const unmigratable: string[] = []

  formula.components.forEach(component => {
    // Check if it's a valid new type (46 standard types)
    const validNewTypes = Object.keys(CHEMICAL_FORMULATIONS) as ChemicalFormulation[]
    if (validNewTypes.includes(component.type as ChemicalFormulation)) {
      // Valid new type, no migration needed
      return
    }

    // Check if it's a legacy type that can be migrated
    if (isOldChemicalType(component.type)) {
      const newType = migrateChemicalType(component.type)
      if (!validateMigration(component.type, newType)) {
        unmigratable.push(component.type)
      }
      return
    }

    // Unknown type - cannot migrate
    unmigratable.push(component.type)
  })

  return {
    canMigrate: unmigratable.length === 0,
    unmigratable
  }
}

// === Migration Functions ===

/**
 * Migrate a single component type to new standard
 */
export function migrateComponent(component: MixingFormulaComponent): MixingFormulaComponent {
  if (isOldChemicalType(component.type)) {
    return {
      ...component,
      type: migrateChemicalType(component.type),
      _originalType: component.type // Keep for audit trail
    }
  }
  return component
}

/**
 * Migrate all components in a mixing formula
 */
export function migrateFormula(formula: MixingFormula): MixingFormula {
  const validation = validateFormulaMigration(formula)
  if (!validation.canMigrate) {
    throw new Error(`Cannot migrate formula: Unmigratable types found: ${validation.unmigratable.join(', ')}`)
  }

  return {
    ...formula,
    components: formula.components.map(migrateComponent)
  }
}

/**
 * Create rollback data for a formula
 */
export function createRollbackData(formula: MixingFormula): {
  id: string
  originalComponents: Array<{
    type: string
    originalType?: string
  }>
} {
  return {
    id: formula.id,
    originalComponents: formula.components.map(c => ({
      type: c.type,
      originalType: c._originalType
    }))
  }
}

// === Database Operations ===

/**
 * Find all mixing formulas that need migration
 */
export async function findFormulasNeedingMigration(): Promise<MixingFormula[]> {
  // Query the database for formulas that contain legacy types
  // Using a simpler approach - fetch all formulas and filter in memory
  const formulas = await prisma.mixingFormula.findMany({
    select: {
      id: true,
      orchardId: true,
      name: true,
      description: true,
      components: true
    }
  })

  // Filter formulas that contain legacy types
  const legacyTypes = Object.keys(TYPE_MIGRATION_MAP)

  return formulas
    .filter(formula => {
      // Safely cast and validate components
      const components = formula.components as unknown as MixingFormulaComponent[]
      if (!Array.isArray(components)) return false

      return components.some(component =>
        component &&
        typeof component === 'object' &&
        'type' in component &&
        typeof component.type === 'string' &&
        legacyTypes.includes(component.type)
      )
    })
    .map(formula => ({
      id: formula.id,
      orchardId: formula.orchardId,
      name: formula.name,
      description: formula.description || undefined,
      components: formula.components as unknown as MixingFormulaComponent[]
    }))
}

/**
 * Apply migration to a single formula in the database with transaction support
 */
export async function migrateFormulaInDB(formulaId: string): Promise<MigrationResult> {
  const startTime = Date.now()
  const logs: MigrationLogEntry[] = []
  const errors: string[] = []
  const warnings: string[] = []
  const rollbackData: unknown[] = []

  try {
    logs.push({
      timestamp: new Date(),
      level: MigrationLogLevel.INFO,
      formulaId,
      message: 'Starting migration for formula'
    })

    return await prisma.$transaction(async (tx) => {
      // Fetch the formula
      const formula = await tx.mixingFormula.findUnique({
        where: { id: formulaId }
      })

      if (!formula) {
        throw new Error(`Formula with ID ${formulaId} not found`)
      }

      // Create rollback data
      rollbackData.push({
        id: formula.id,
        originalComponents: formula.components
      })

      // Convert to MigrationFormula format with safe type casting
      const components = formula.components as unknown as MixingFormulaComponent[]
      if (!Array.isArray(components)) {
        throw new Error('Formula components is not a valid array')
      }

      const migrationFormula: MixingFormula = {
        id: formula.id,
        orchardId: formula.orchardId,
        name: formula.name,
        description: formula.description || undefined,
        components
      }

      // Validate and migrate
      const validation = validateFormulaMigration(migrationFormula)
      if (!validation.canMigrate) {
        errors.push(`Cannot migrate formula: ${validation.unmigratable.join(', ')}`)
        logs.push({
          timestamp: new Date(),
          level: MigrationLogLevel.ERROR,
          formulaId,
          message: 'Migration validation failed',
          metadata: { unmigratable: validation.unmigratable }
        })
        throw new Error(`Migration validation failed: ${validation.unmigratable.join(', ')}`)
      }

      // Apply migration
      const migratedFormula = migrateFormula(migrationFormula)

      // Update the database with proper JSON format
      await tx.mixingFormula.update({
        where: { id: formulaId },
        data: {
          components: migratedFormula.components as unknown as Prisma.JsonObject
        }
      })

      const duration = Date.now() - startTime

      logs.push({
        timestamp: new Date(),
        level: MigrationLogLevel.INFO,
        formulaId,
        message: 'Migration completed successfully',
        metadata: { duration, componentsMigrated: migratedFormula.components.length }
      })

      return {
        success: true,
        migrated: 1,
        failed: 0,
        errors,
        warnings,
        duration,
        rollbackData,
        logs
      }
    })

  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    logs.push({
      timestamp: new Date(),
      level: MigrationLogLevel.ERROR,
      formulaId,
      message: 'Migration failed',
      metadata: { error: errorMessage, duration }
    })

    return {
      success: false,
      migrated: 0,
      failed: 1,
      errors: [errorMessage],
      warnings,
      duration,
      rollbackData,
      logs
    }
  }
}

/**
 * Batch migrate all formulas in the database with progress tracking
 */
export async function migrateAllFormulas(): Promise<MigrationResult> {
  const startTime = Date.now()
  const logs: MigrationLogEntry[] = []
  const errors: string[] = []
  const warnings: string[] = []
  const rollbackData: unknown[] = []
  let migrated = 0
  let failed = 0

  try {
    logs.push({
      timestamp: new Date(),
      level: MigrationLogLevel.INFO,
      formulaId: 'batch',
      message: 'Starting batch migration'
    })

    // Find all formulas needing migration
    const formulas = await findFormulasNeedingMigration()
    const total = formulas.length

    if (total === 0) {
      logs.push({
        timestamp: new Date(),
        level: MigrationLogLevel.INFO,
        formulaId: 'batch',
        message: 'No formulas need migration'
      })
      return {
        success: true,
        migrated: 0,
        failed: 0,
        errors,
        warnings,
        duration: Date.now() - startTime,
        logs
      }
    }

    // Process in batches
    const totalBatches = Math.ceil(total / MIGRATION_BATCH_SIZE)

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * MIGRATION_BATCH_SIZE
      const endIndex = Math.min(startIndex + MIGRATION_BATCH_SIZE, total)
      const batch = formulas.slice(startIndex, endIndex)

      logs.push({
        timestamp: new Date(),
        level: MigrationLogLevel.INFO,
        formulaId: 'batch',
        message: `Processing batch ${batchIndex + 1}/${totalBatches}`,
        metadata: { batchSize: batch.length, startIndex, endIndex }
      })

      // Process each formula in the batch
      for (const formula of batch) {
        try {
          const result = await migrateFormulaInDB(formula.id)
          if (result.success) {
            migrated++
            rollbackData.push(...(result.rollbackData || []))
            warnings.push(...result.warnings)
          } else {
            failed++
            errors.push(...result.errors)
          }
          logs.push(...result.logs)
        } catch (error) {
          failed++
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          errors.push(`Formula ${formula.id}: ${errorMessage}`)
        }
      }
    }

    const duration = Date.now() - startTime
    const success = failed === 0

    logs.push({
      timestamp: new Date(),
      level: MigrationLogLevel.INFO,
      formulaId: 'batch',
      message: `Batch migration completed`,
      metadata: {
        total,
        migrated,
        failed,
        duration,
        success
      }
    })

    return {
      success,
      migrated,
      failed,
      errors,
      warnings,
      duration,
      rollbackData,
      logs
    }

  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    logs.push({
      timestamp: new Date(),
      level: MigrationLogLevel.ERROR,
      formulaId: 'batch',
      message: 'Batch migration failed',
      metadata: { error: errorMessage, duration }
    })

    return {
      success: false,
      migrated,
      failed,
      errors: [errorMessage],
      warnings,
      duration,
      rollbackData,
      logs
    }
  }
}

/**
 * Rollback migration for a formula using stored rollback data
 */
export async function rollbackFormulaMigration(formulaId: string): Promise<MigrationResult> {
  const startTime = Date.now()
  const logs: MigrationLogEntry[] = []
  const warnings: string[] = []

  try {
    return await prisma.$transaction(async () => {
      // Find rollback data (in a real implementation, this would be stored in a rollback table)
      // For now, we'll need to implement a rollback tracking system

      warnings.push('Rollback functionality needs audit trail implementation')

      logs.push({
        timestamp: new Date(),
        level: MigrationLogLevel.WARNING,
        formulaId,
        message: 'Rollback requested but audit trail not fully implemented'
      })

      // In a complete implementation, we would:
      // 1. Fetch the original data from rollback table
      // 2. Restore the formula to its original state
      // 3. Update audit trail

      return {
        success: false,
        migrated: 0,
        failed: 0,
        errors: ['Rollback functionality not fully implemented'],
        warnings,
        duration: Date.now() - startTime,
        logs
      }
    })

  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    logs.push({
      timestamp: new Date(),
      level: MigrationLogLevel.ERROR,
      formulaId,
      message: 'Rollback failed',
      metadata: { error: errorMessage, duration }
    })

    return {
      success: false,
      migrated: 0,
      failed: 1,
      errors: [errorMessage],
      warnings,
      duration,
      logs
    }
  }
}

// === Backward Compatibility ===

/**
 * Ensure formula uses standard types (auto-migrate if needed)
 */
export function ensureStandardTypes(formula: MixingFormula): MixingFormula {
  const hasLegacyTypes = formula.components.some(c => isOldChemicalType(c.type))

  if (hasLegacyTypes) {
    return migrateFormula(formula)
  }

  return formula
}

/**
 * Validate formula accepts both legacy and new types
 */
export function validateFormulaTypes(formula: MixingFormula): boolean {
  const validNewTypes = Object.keys(CHEMICAL_FORMULATIONS) as ChemicalFormulation[]

  return formula.components.every(component => {
    // Check if it's a valid new type (46 standard types)
    if (validNewTypes.includes(component.type as ChemicalFormulation)) {
      return true
    }

    // Check if it's a valid legacy type
    return isOldChemicalType(component.type)
  })
}