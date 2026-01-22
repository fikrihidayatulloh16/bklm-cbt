/*
  Warnings:

  - A unique constraint covering the columns `[submission_id,question_id]` on the table `Answer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Answer_submission_id_question_id_idx";

-- CreateIndex
CREATE INDEX "Answer_question_id_idx" ON "Answer"("question_id");

-- CreateIndex
CREATE INDEX "Answer_submission_id_idx" ON "Answer"("submission_id");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_submission_id_question_id_key" ON "Answer"("submission_id", "question_id");
