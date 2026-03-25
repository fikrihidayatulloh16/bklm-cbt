import { Module, forwardRef } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { SubmissionRepository } from './repository/submissions.repository';
import { QuestionRepository } from './repository/question.repository';
import { AnswerRepository } from './repository/answer.repository';
import { AssessmentModule } from 'src/assessment/assessment.module';
import { SubmissionsGateway } from './submissions.gateway';


@Module({
  imports: [
    forwardRef(() => AssessmentModule)
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService, SubmissionRepository, QuestionRepository, AnswerRepository, SubmissionsGateway],
  exports: [SubmissionRepository, QuestionRepository, AnswerRepository, SubmissionsGateway]
})
export class SubmissionsModule {}
