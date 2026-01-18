/*
  Warnings:

  - You are about to drop the column `expired_at` on the `Assessment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "expired_at",
ADD COLUMN     "duration" INTEGER;

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
