/*
  Warnings:

  - Made the column `type` on table `trees` required. This step will fail if there are existing NULL values in that column.
  - Made the column `variety` on table `trees` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "trees" ALTER COLUMN "type" SET NOT NULL,
ALTER COLUMN "variety" SET NOT NULL;
