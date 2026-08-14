// apps/api/src/assessment-session/assessment-session.service.ts
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

  // 🔥 Fungsi 1: Dipanggil oleh Gateway Modul Assessment (Publish Langsung)
  async createSessionForPublish(
    assessmentId: string, sessionName: string, durationMs: number, classIds: string[]
  ) {
    const newSession = AssessmentSessionDomain.createAtPublish(
      assessmentId, sessionName, durationMs, classIds
    );
    await this.sessionRepo.create(newSession);
  }

  // 🔥 Fungsi 2: Dipanggil oleh Controller Session sendiri (Penjadwalan Manual)
  async createScheduledSession(dto: CreateAssessmentSessionDto) {
    const newSession = AssessmentSessionDomain.createScheduled(
      dto.assessment_id,
      dto.name,
      new Date(dto.start_time), // DTO mengirim string, kita ubah ke Date
      new Date(dto.end_time),
      dto.class_ids
    );
    await this.sessionRepo.create(newSession);
    return newSession;
  }

  // 🔥 FUNGSI 1: Untuk mengambil SEMUA sesi aktif di suatu Assessment (Jika dibutuhkan di tempat lain)
  async getActiveSessionsByAssessmentId(assessmentId: string): Promise<AssessmentSessionDomain[]> {
    const cacheKey = `sessions:active:assessment:${assessmentId}`;
    return this.cacheRepo.getOrSet(cacheKey, async () => {
      // Pastikan fungsi ini di Repo murni mencari by assessment_id
      return await this.sessionRepo.findActiveSessionsByAssessmentId(assessmentId); 
    }, CacheTTL.LONG_LIVED);
  }

  // 🔥 FUNGSI 2 (YANG PALING KITA BUTUHKAN SEKARANG): 
  // Mengambil 1 Sesi Spesifik (Digunakan oleh Frontend untuk Dropdown Kelas, DAN oleh Submission Gateway)
  async getSessionById(sessionId: string): Promise<AssessmentSessionDomain | null> {
    const cacheKey = `session:detail:${sessionId}`;

    return this.cacheRepo.getOrSet(
      cacheKey,
      async () => {
        // Ingat! Di dalam findById ini, Prisma WAJIB menggunakan "include: { classes: true }"
        // agar Domain memiliki array of classId
        return await this.sessionRepo.findSessionBySessionId(sessionId);
      },
      CacheTTL.LONG_LIVED // TTL 1 menit
    );
  }

  async getActiveSessionsByClassId(classId: string): Promise<AssessmentSessionDomain[]> {
    // Kunci cache unik per kelas
    const cacheKey = `sessions:active:class:${classId}`;

    return this.cacheRepo.getOrSet(
      cacheKey,
      async () => {
        // Minta repo mencari sesi berdasarkan kelas
        return await this.sessionRepo.findActiveSessionsByClassId(classId);
      },
      CacheTTL.LONG_LIVED // TTL 1 Menit cocok untuk ini
    );
  }

  //Get all submission by session id
  // async getSubmissionsBySessionId(sessionId: string): Promise<AssessmentSessionDomain[]> {
  //   const cacheKey = `sessions:submissions:${sessionId}`;
  //   return this.cacheRepo.getOrSet(
  //           cacheKey,
  //     async () => {
  //       return await this.sessionRepo.findSubmissionsBySession(sessionId);
  //     },
  //     CacheTTL.LONG_LIVED
  //   )
  // }
  
}