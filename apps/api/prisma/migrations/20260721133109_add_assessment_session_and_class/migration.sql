/*
  Warnings:

  - You are about to drop the column `expired_at` on the `Assessment` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `Assessment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "expired_at",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
