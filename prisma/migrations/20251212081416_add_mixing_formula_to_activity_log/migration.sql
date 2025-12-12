-- AlterTable
ALTER TABLE "activity_logs" ADD COLUMN     "mixing_formula_id" TEXT;

-- CreateTable
CREATE TABLE "mixing_formulas" (
    "id" TEXT NOT NULL,
    "orchardId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "components" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "mixing_formulas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_logs_mixing_formula_id_idx" ON "activity_logs"("mixing_formula_id");

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_mixing_formula_id_fkey" FOREIGN KEY ("mixing_formula_id") REFERENCES "mixing_formulas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mixing_formulas" ADD CONSTRAINT "mixing_formulas_orchardId_fkey" FOREIGN KEY ("orchardId") REFERENCES "orchards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
