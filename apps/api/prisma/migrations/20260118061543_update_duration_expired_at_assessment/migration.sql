-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "expired_at" TIMESTAMP(3),
ALTER COLUMN "duration" SET DEFAULT 0;
