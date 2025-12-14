-- DropForeignKey
ALTER TABLE "mixing_formulas" DROP CONSTRAINT "mixing_formulas_orchardId_fkey";

-- AlterTable
ALTER TABLE "mixing_formulas" ALTER COLUMN "orchardId" DROP NOT NULL;

-- Migrate existing orchard-specific formulas to global formulas
-- This makes all existing formulas accessible across all orchards
UPDATE "mixing_formulas"
SET "orchardId" = NULL
WHERE "orchardId" IS NOT NULL;

-- AddForeignKey
ALTER TABLE "mixing_formulas" ADD CONSTRAINT "mixing_formulas_orchardId_fkey" FOREIGN KEY ("orchardId") REFERENCES "orchards"("id") ON DELETE SET NULL ON UPDATE CASCADE;
