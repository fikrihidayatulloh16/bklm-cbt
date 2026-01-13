/*
  Warnings:

  - A unique constraint covering the columns `[email,google_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('FREE', 'INVITED', 'ACTIVE');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_school_id_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "google_id" TEXT,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'FREE',
ALTER COLUMN "password_hash" DROP NOT NULL,
ALTER COLUMN "school_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_google_id_key" ON "User"("email", "google_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
