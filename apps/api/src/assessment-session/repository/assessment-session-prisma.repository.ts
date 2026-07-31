// apps/api/src/assessment-session/repository/assessment-session-prisma.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Sesuaikan path jika perlu
import { IAssessmentSessionRepository } from '../ports/assessment-session.repository.port';
import { CreateAssessmentSessionDto } from '../dto/create-assessment-session.dto';
import { AssessmentSessionDomain } from '../entities/assessment-session.domain';
import { AssessmentSessionMapper } from '../mapper/assessment-session.mapper';

@Injectable()
export class AssessmentSessionPrismaRepository implements IAssessmentSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: AssessmentSessionDomain): Promise<AssessmentSessionDomain> {
    const session = await this.prisma.assessmentSession.create({
      data: {
        name: dto._name,
        start_time: new Date(dto._startTime),
        end_time: new Date(dto._endTime),
        assessment_id: dto._assessmentId,
        // Keajaiban Prisma: Mengikat banyak kelas sekaligus!
        classes: {
          connect: dto._classIds?.map((id) => ({ id })),
        },
      },
      // Beri tahu Prisma untuk mengembalikan data kelas yang baru saja diikat
      include: {
        classes: true,
      },
    });

    return AssessmentSessionMapper.toDomain(session);
  }

  async findActiveSessionsByClass(classId: string): Promise<AssessmentSessionDomain[]> {
    const now = new Date();

    const sessions = await this.prisma.assessmentSession.findMany({
      where: {
        // 1. Sesi tersebut harus terkait dengan Class ID ini
        classes: {
          some: { id: classId },
        },
        // 2. Waktu sekarang harus berada di antara start_time dan end_time
        start_time: { lte: now },
        end_time: { gte: now },
      },
      include: {
        classes: true,
      },
      orderBy: {
        start_time: 'asc', // Urutkan dari yang paling cepat dimulai
      },
    });

    return sessions.map((session) => AssessmentSessionMapper.toDomain(session));
  }
}