/*
  Warnings:

  - You are about to drop the column `class` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `student` on the `Assessment` table. All the data in the column will be lost.
  - Added the required column `class` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_name` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "class",
DROP COLUMN "gender",
DROP COLUMN "student";

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "class" TEXT NOT NULL,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "student_name" TEXT NOT NULL;
