import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IAssessmentSessionRepository } from './ports/assessment-session.repository.port';
import { CacheTTL, ICacheRepository, I_CACHE_REPOSITORY } from 'src/common/cache/cache.repository.port';
import { AssessmentSessionDomain } from './entities/assessment-session.domain';
import { CreateAssessmentSessionDto } from './dto/create-assessment-session.dto';

@Injectable()
export class AssessmentSessionService {
  constructor(
    @Inject('IAssessmentSessionRepository')
    private readonly sessionRepo: IAssessmentSessionRepository,

    @Inject(I_CACHE_REPOSITORY)
    private readonly cacheRepo: ICacheRepository, // 👈 Port disuntikkan
  ) {}

  async createSession(
    assessmentId: string,
    sessionName: string,
    durationMs: number,
    classIds: string[]
  ) {
    // 1. DOMAIN LOGIC: Dirakit di rumahnya sendiri!
    const newSession = AssessmentSessionDomain.createAtPublish(
      assessmentId,
      sessionName,
      durationMs,
      classIds
    );

    // 2. Simpan ke database menggunakan repository milik Session
    await this.sessionRepo.create(newSession);
  }

  async getSessionByAssessmentId(assessmentId: string): Promise<AssessmentSessionDomain[]> {
    const cacheKey = `sessions:active:class:${assessmentId}`;

    // 🔥 KEMURNIAN LEVEL MAKSIMAL: Hanya deklarasi kunci, asal data, dan TTL
    return this.cacheRepo.getOrSet(
      cacheKey,
      async () => {
        // Ini adalah callback (fetcher) yang hanya dipanggil jika Cache Miss
        return await this.sessionRepo.findActiveSessionsByClass(assessmentId);
      },
      CacheTTL.LONG_LIVED // TTL 1 menit
    );
  }
}