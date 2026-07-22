import { Injectable, Inject } from '@nestjs/common';
import { ISessionGateway, SessionValidationInfo } from '../ports/session.gateway.port';
import { ICacheRepository, I_CACHE_REPOSITORY } from 'src/common/cache/cache.repository.port';
// 💡 Kita import Prisma langsung di sini jika Cache Miss
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SessionGatewayAdapter implements ISessionGateway {
  constructor(
    @Inject(I_CACHE_REPOSITORY) private readonly cache: ICacheRepository,
    private readonly prisma: PrismaService
  ) {}

  async getSessionForValidation(sessionId: string): Promise<SessionValidationInfo | null> {
    const cacheKey = `session:validation:${sessionId}`;

    // 1. Coba dari Cache dulu
    const cached = await this.cache.getObj<SessionValidationInfo>(cacheKey);
    if (cached) return cached;

    // 2. Jika tidak ada di Cache, ambil dari Database
    // (Perhatikan: Modul Submission HANYA mengambil data yang ia butuhkan)
    const session = await this.prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: { classes: true }
    });

    if (!session) return null;

    const validationInfo: SessionValidationInfo = {
      endTime: session.end_time,
      classIds: session.classes.map(c => c.id) // atau c.name tergantung desain Anda
    };

    // 3. Simpan di Cache (Misal 5 menit) agar hit startSubmission selanjutnya ngebut!
    await this.cache.setObj(cacheKey, validationInfo, 5);

    return validationInfo;
  }
}