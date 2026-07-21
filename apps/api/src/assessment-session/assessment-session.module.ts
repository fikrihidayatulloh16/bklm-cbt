// apps/api/src/assessment-session/assessment-session.module.ts
import { Module } from '@nestjs/common';
import { AssessmentSessionController } from './assessment-session.controller';
import { AssessmentSessionService } from './assessment-session.service';
import { IAssessmentSessionRepository } from './ports/assessment-session.repository.port';
import { AssessmentSessionPrismaRepository } from './repository/assessment-session-prisma.repository';
// Pastikan Anda mengimpor PrismaModule dari tempat yang benar
import { PrismaModule } from 'src/prisma/prisma.module'; 
import { GlobalCacheModule } from 'src/common/cache/cache.module';

@Module({
  imports: [PrismaModule],
  controllers: [AssessmentSessionController],
  providers: [
    AssessmentSessionService,
    // 💡 Di sinilah kita memberi tahu NestJS:
    // "Jika ada yang meminta IAssessmentSessionRepository, berikan AssessmentSessionPrismaRepository"
    {
      provide: 'IAssessmentSessionRepository',
      useClass: AssessmentSessionPrismaRepository,
    },
  ],
})
export class AssessmentSessionModule {}