import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IAssessmentSessionRepository } from './ports/assessment-session.repository.port';
import { ICacheRepository, I_CACHE_REPOSITORY } from 'src/common/cache/cache.repository.port';
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

  async createSession(dto: CreateAssessmentSessionDto): Promise<AssessmentSessionDomain> {
    // 💡 Logika Bisnis: Validasi Timeline Ujian
    const startTime = new Date(dto.start_time);
    const endTime = new Date(dto.end_time);

    if (startTime >= endTime) {
      throw new BadRequestException('Waktu mulai harus lebih awal dari waktu selesai.');
    }

    // Jika butuh validasi "Apakah sesi ini bentrok dengan sesi lain di kelas yang sama?",
    // Anda bisa memanggil this.sessionRepo.findOverlappingSessions() di sini nantinya.

    return await this.sessionRepo.create(dto);
  }

  async getActiveSessions(classId: string): Promise<AssessmentSessionDomain[]> {
    const cacheKey = `sessions:active:class:${classId}`;

    // 🔥 KEMURNIAN LEVEL 10: Service memanggil objek langsung
    const cached = await this.cacheRepo.getObj<AssessmentSessionDomain[]>(cacheKey);
    if (cached) {
      console.log('⚡ Cache hit');
      return cached;
    }

    console.log('🐢 Cache miss, mengambil dari database');
    const data = await this.sessionRepo.findActiveSessionsByClass(classId);

    // 🔥 KEMURNIAN LEVEL 10: Service melempar objek langsung
    await this.cacheRepo.setObj(cacheKey, data, 60); // TTL 1 menit

    return data;
  }
}