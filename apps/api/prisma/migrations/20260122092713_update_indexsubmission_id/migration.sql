-- DropIndex
DROP INDEX "Answer_question_id_idx";

-- DropIndex
DROP INDEX "Answer_submission_id_idx";

-- CreateIndex
CREATE INDEX "Answer_submission_id_question_id_idx" ON "Answer"("submission_id", "question_id");
