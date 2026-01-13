/*
  Warnings:

  - You are about to drop the column `class` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `class_snapshot` on the `Submission` table. All the data in the column will be lost.
  - Added the required column `class_name` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "class",
DROP COLUMN "class_snapshot",
ADD COLUMN     "class_name" TEXT NOT NULL,
ALTER COLUMN "student_id" DROP NOT NULL;
