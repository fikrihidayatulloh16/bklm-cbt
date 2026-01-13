/*
  Warnings:

  - You are about to drop the column `order` on the `BankQuestionOption` table. All the data in the column will be lost.
  - Added the required column `class` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expired_at` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student` to the `Assessment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "QuestionType" ADD VALUE 'YES_NO';

-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "class" TEXT NOT NULL,
ADD COLUMN     "expired_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "student" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "BankQuestionOption" DROP COLUMN "order";

-- AlterTable
ALTER TABLE "QuestionBank" ADD COLUMN     "shared" BOOLEAN NOT NULL DEFAULT false;
