#!/usr/bin/env tsx

/**
 * Migration script to convert orchard-specific formulas to global formulas
 * This script sets orchardId to null for all existing formulas
 * Run this script after updating the schema to make orchardId optional
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateFormulasToGlobal() {
  console.log('🔄 Starting migration of orchard-specific formulas to global formulas...');

  try {
    // Check if there are any formulas with orchardId
    const formulasWithOrchard = await prisma.mixingFormula.count({
      where: {
        orchardId: {
          not: null
        }
      }
    });

    if (formulasWithOrchard === 0) {
      console.log('✅ No orchard-specific formulas found. Migration not needed.');
      return;
    }

    console.log(`📊 Found ${formulasWithOrchard} orchard-specific formulas to migrate`);

    // Backup the formulas before migration
    const formulasToMigrate = await prisma.mixingFormula.findMany({
      where: {
        orchardId: {
          not: null
        }
      }
    });

    console.log('💾 Creating backup of formulas to migrate...');
    console.table(formulasToMigrate.map(f => ({
      id: f.id,
      name: f.name,
      orchardId: f.orchardId,
      usedCount: f.usedCount,
      createdAt: f.createdAt
    })));

    // Update all formulas to set orchardId to null (making them global)
    const result = await prisma.mixingFormula.updateMany({
      where: {
        orchardId: {
          not: null
        }
      },
      data: {
        orchardId: null
      }
    });

    console.log(`✅ Successfully migrated ${result.count} formulas to global access`);
    console.log('🎉 Migration completed successfully!');

    console.log('\n📝 Summary:');
    console.log(`- Formulas migrated: ${result.count}`);
    console.log('- All formulas are now globally accessible across all orchards');
    console.log('- No data was lost during migration');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Please check the error and try again');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateFormulasToGlobal();
}

export { migrateFormulasToGlobal };