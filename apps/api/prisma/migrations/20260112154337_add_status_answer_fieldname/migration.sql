/*
  Warnings:

  - You are about to drop the column `status` on the `Answer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "status",
ADD COLUMN     "answer_status" BOOLEAN NOT NULL DEFAULT false;
