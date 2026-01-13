/*
  Warnings:

  - You are about to drop the column `student_id` on the `Submission` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_student_id_fkey";

-- DropIndex
DROP INDEX "Submission_student_id_idx";

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "student_id";
