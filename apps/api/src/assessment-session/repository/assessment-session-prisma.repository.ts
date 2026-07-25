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

  async create(dto: CreateAssessmentSessionDto): Promise<AssessmentSessionDomain> {
    const session = await this.prisma.assessmentSession.create({
      data: {
        name: dto.name,
        start_time: new Date(dto.start_time),
        end_time: new Date(dto.end_time),
        assessment_id: dto.assessment_id,
        // Keajaiban Prisma: Mengikat banyak kelas sekaligus!
        classes: {
          connect: dto.class_ids.map((id) => ({ id })),
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

  async findSessionByAssessmentId(assessmentId: string): Promise<AssessmentSessionDomain | null> {
    const sessionRecord = await this.prisma.assessmentSession.findFirst({
      where: {
        assessment_id: assessmentId // Sesuaikan dengan nama kolom di schema.prisma Anda
      },
      include: {
        classes: true // Sertakan relasi jika Domain Anda membutuhkannya
      }
    });

    if (!sessionRecord) return null;

    // 🔥 KEMURNIAN DOMAIN: Transformasi dari Prisma Model ke Domain Model
    // Gunakan mapper yang sudah Anda buat sebelumnya di proyek ini
    return AssessmentSessionMapper.toDomain(sessionRecord); 
  }
}