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

  async seedMasterData(schoolId: string, userId: string) {
    await this.prisma.school.create({ data: { id: schoolId, name: 'SMK BKLM' } });
    await this.prisma.user.create({
      data: { 
        id: userId, 
        email: 'guru.sub@test.com', 
        name: 'Guru Sub', 
        role: 'TEACHER',
        google_id: 'google-sub-123',
        school_id: schoolId 
      },
    });
  }

  async seedAssessment(id: string, userId: string, schoolId: string, status: 'ACTIVE' | 'TIMEOUT' | 'DRAFT') {
    // 👇 PERBAIKAN: Deklarasikan tipe data secara eksplisit
    let expiredAt: Date | null = null; 

    if (status === 'TIMEOUT') {
      expiredAt = new Date();
      expiredAt.setMinutes(expiredAt.getMinutes() - 3);
    } else if (status === 'ACTIVE') {
      expiredAt = new Date();
      expiredAt.setHours(expiredAt.getHours() + 2);
    }

    await this.prisma.assessment.create({
      data: {
        id,
        title: `Ujian ${status}`,
        user_id: userId,
        school_id: schoolId,
        expired_at: expiredAt, 
      }
    });
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

  async seedSubmission(id: string, assessmentId: string, status: 'IN_PROGRESS' | 'FINISHED', studentName: string = 'Fikri E2E') {
    await this.prisma.submission.create({
      data: {
        id,
        assessment_id: assessmentId,
        student_name: studentName,
        class_name: 'XII RPL',
        gender: 'Male',
        status,
      }
    });
  }
}