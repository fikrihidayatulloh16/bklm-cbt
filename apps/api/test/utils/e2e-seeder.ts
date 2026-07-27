// test/utils/e2e-seeder.ts
import { PrismaService } from '../../src/prisma/prisma.service';

export class E2eSeeder {
  constructor(private readonly prisma: PrismaService) {}

  async cleanDatabase() {
    // Teardown berurutan dari relasi terbawah ke atas
    await this.prisma.answer.deleteMany();
    await this.prisma.submission.deleteMany();
    await this.prisma.bankQuestion.deleteMany(); 
    await this.prisma.questionOption.deleteMany();
    await this.prisma.question.deleteMany();
    await this.prisma.questionBank.deleteMany();
    await this.prisma.assessmentSession.deleteMany();
    await this.prisma.assessment.deleteMany();
    await this.prisma.class.deleteMany();
    await this.prisma.user.deleteMany();
    await this.prisma.school.deleteMany();
  }

  async seedMasterData(schoolId: string, userId: string, classId: string = 'class-1') {
    // 1. Upsert School
    await this.prisma.school.upsert({ 
        where: { id: schoolId },
        update: {}, // Jika ada, biarkan saja
        create: { id: schoolId, name: 'SMK BKLM' } 
    });

    // 2. Upsert User (Teacher)
    await this.prisma.user.upsert({
      where: { id: userId }, // atau { email: 'guru.sub@test.com' } jika ID bukan primary key
      update: {},
      create: { 
        id: userId, 
        email: 'guru.sub@test.com', 
        name: 'Guru Sub', 
        role: 'TEACHER',
        google_id: 'google-sub-123',
        school_id: schoolId 
      },
    });

    // 3. Upsert Class
    await this.prisma.class.upsert({
      where: { id: classId },
      update: {},
      create: { id: classId, name: 'RPL', level: 'VII', school_id: schoolId }
    });
  }

  async seedAssessment(
    assessmentId: string, 
    userId: string, 
    schoolId: string, 
    status: 'ACTIVE' | 'TIMEOUT' | 'DRAFT',
    sessionId: string = 'session-1',
    duration: number = 90,
    classId: string = 'class-1' // 🔥 Tambahkan parameter classId (default: 'class-1')
  ) {
    // 1. Buat Data Ujian Induk
    await this.prisma.assessment.create({
      data: {
        id: assessmentId,
        title: `Ujian Skenario ${status}`,
        user_id: userId,
        school_id: schoolId,
        duration: duration,
        assessment_status: status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
      }
    });

    // 2. Buat Data Sesi Jika Bukan DRAFT
    if (status !== 'DRAFT') {
      const now = new Date();
      const endTime = new Date();

      if (status === 'TIMEOUT') {
        endTime.setMinutes(endTime.getMinutes() - 5); 
      } else {
        endTime.setMinutes(endTime.getMinutes() + 90);
      }

      await this.prisma.assessmentSession.create({
        data: {
          id: sessionId,
          assessment_id: assessmentId,
          name: `Sesi ${status}`,
          start_time: now,
          end_time: endTime,
          // 🔥 SAMBUNGKAN SESI DENGAN KELAS (Relasi Prisma)
          // Catatan: Sesuaikan kata 'classes' jika nama relasi di schema.prisma Anda berbeda
          // (misalnya: 'class', 'SessionClasses', atau sekadar field JSON 'class_ids')
          classes: {
             connect: [{ id: classId }]
          }
        }
      });
    }
  }

  async seedQuestion(id: string, assessmentId: string, type: 'YES_NO' | 'MULTIPLE_CHOICE') {
    await this.prisma.question.create({
      data: {
        id,
        assessment_id: assessmentId,
        text: 'Apakah anda sudah makan?',
        type,
        category: 'Pribadi'
      }
    });
  }

  async seedQuestionOption(id: string, questionId: string, label: string, score: number) {
    await this.prisma.questionOption.create({ 
      data: { id, question_id: questionId, label, score } 
    });
  }

  async seedSubmission(
    submissionId: string, 
    assessmentId: string, 
    status: 'IN_PROGRESS' | 'FINISHED',
    sessionId: string = 'session-1' // 🔥 Tambahkan parameter ini
  ) {
    await this.prisma.submission.create({
      data: {
        id: submissionId,
        assessment_id: assessmentId,
        session_id: sessionId, // 🔥 Wajib dimasukkan agar terhubung!
        status: status,
        student_name: "fikri",
        class_name: 'sdf',
        gender: 'MALE',
        // (Isi field wajib lainnya seperti user_id, dll jika ada)
        // : 'user-ans-1', // Asumsi ada field user_id di tabel submission
      }
    });
  }
}