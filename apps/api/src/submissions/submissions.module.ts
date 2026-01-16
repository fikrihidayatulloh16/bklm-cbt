import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { SubmissionRepository } from './repository/submissions.repository';
import { QuestionRepository } from './repository/question.repository';
import { AnswerRepository } from './repository/answer.repository';
import { AssessmentModule } from 'src/assessment/assessment.module';


@Module({
  imports: [AssessmentModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService, SubmissionRepository, QuestionRepository, AnswerRepository],
  exports: [SubmissionRepository, QuestionRepository, AnswerRepository]
})
export class SubmissionsModule {}
