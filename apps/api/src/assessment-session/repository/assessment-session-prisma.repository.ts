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

  // 🔥 FUNGSI BARU UNTUK MENCARI 1 SESI (PENTING UNTUK START SUBMISSION)
  async findSessionBySessionId(sessionId: string): Promise<AssessmentSessionDomain | null> {
    const data = await this.prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: {
        classes: true, // 🚨 WAJIB di-include agar tahu sesi ini untuk kelas mana saja
      },
    });

    if (!data) return null;

    // Mapper: Mengubah dari format Prisma ke format Domain
    return new AssessmentSessionDomain(
      data.id,
      data.name,
      data.start_time,
      data.end_time,
      data.assessment_id,
      data.classes.map((c) => c.id) // Mengekstrak array of string (classId)
    );
  }

  // 🔥 FUNGSI LAMA YANG DIPERBAIKI (Mencari banyak sesi by Assessment)
  async findActiveSessionsByAssessmentId(assessmentId: string): Promise<AssessmentSessionDomain[]> {
    const now = new Date();
    
    const data = await this.prisma.assessmentSession.findMany({
      where: {
        assessment_id: assessmentId,
        // (Opsional) Filter hanya sesi yang belum berakhir
        end_time: {
          gt: now,
        },
      },
      include: {
        classes: true,
      },
    });

    return data.map(
      (session) =>
        new AssessmentSessionDomain(
          session.id,
          session.name,
          session.start_time,
          session.end_time,
          session.assessment_id,
          session.classes.map((c) => c.id)
        )
    );
  }

  async findActiveSessionsByClassId(classId: string): Promise<AssessmentSessionDomain[]> {
    const now = new Date();

    const data = await this.prisma.assessmentSession.findMany({
      where: {
        // 🔥 MAGIC PRISMA: Cari Sesi yang memiliki kelas dengan ID ini
        classes: {
          some: {
            id: classId,
          },
        },
        // Logika "Sedang Aktif": Sekarang harus lebih besar dari Start, dan kurang dari End
        start_time: {
          lte: now,
        },
        end_time: {
          gte: now,
        },
      },
      include: {
        classes: true, // Sertakan data kelas jika Domain membutuhkannya
      },
    });

    // Mapper Prisma ke Domain
    return data.map(
      (session) =>
        new AssessmentSessionDomain(
          session.id,
          session.name,
          session.start_time,
          session.end_time,
          session.assessment_id,
          session.classes.map((c) => c.id)
        )
    );
  }
}