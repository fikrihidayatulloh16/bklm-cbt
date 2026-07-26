// apps/api/src/submissions/submissions.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { SubmissionPrismaRepository } from './repository/submissions.repository';
import { QuestionRepository } from './repository/question.repository';
import { AnswerRepository } from './repository/answer.repository';
import { AssessmentModule } from 'src/assessment/assessment.module';
import { SubmissionsGateway } from './submissions.gateway';
import { SyncAnswerDto } from './dto/save-answers,dto';
import { I_SUBMISSION_REPOSITORY } from './ports/submission.repository.port';
import { I_SESSION_GATEWAY } from './ports/session.gateway.port';
import { SessionServiceAdapter } from './adapters/session-gateway.adapter';
import { AssessmentSessionModule } from 'src/assessment-session/assessment-session.module';


@Module({
  imports: [
    forwardRef(() => AssessmentModule),
    AssessmentSessionModule,
  ],
  controllers: [SubmissionsController],
  providers: [
    SubmissionsService, 
    SubmissionPrismaRepository, 
    QuestionRepository, 
    AnswerRepository, 
    SubmissionsGateway,
    {
      provide: I_SUBMISSION_REPOSITORY,
      useClass: SubmissionPrismaRepository, // 👈 NestJS, tolong gunakan Prisma untuk Repository
    },
    {
      provide: I_SESSION_GATEWAY,
      useClass: SessionServiceAdapter,      // 👈 NestJS, tolong gunakan Adapter ini untuk Gateway
    }
  ],
  exports: [SubmissionPrismaRepository, QuestionRepository, AnswerRepository, SubmissionsGateway]
})
export class SubmissionsModule {}
