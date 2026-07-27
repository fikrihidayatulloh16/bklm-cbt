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

  async seedAssessment(
    id: string, 
    userId: string, 
    schoolId: string, 
    duration: number, 
    status: 'CLOSED' | 'DRAFT' | 'PUBLISHED' // 🔥 Tambahkan PUBLISHED
  ) {
    let expiredAt: Date | undefined; 

    if (status === 'CLOSED') {
      expiredAt = new Date();
      expiredAt.setMinutes(expiredAt.getMinutes() - 3);
    } else if (status === 'PUBLISHED') {
      expiredAt = new Date();
      expiredAt.setHours(expiredAt.getHours() + 2);
    }

    await this.prisma.assessment.create({
      data: {
        id,
        title: `Ujian ${status}`,
        user_id: userId,
        school_id: schoolId,
        duration: duration, 
        expired_at: expiredAt,
        // 🔥 INI YANG LUPA ANDA MASUKKAN SEBELUMNYA!
        assessment_status: status, 
      }
    });
  }

  async seedUpdateAssessment(id: string, userId: string, schoolId: string, duration: number, status: 'PUBLISHED' | 'TIMEOUT' | 'DRAFT') {
      await this.prisma.assessment.update({
      where: { id: `Ujian ${status}` },
      data: {
        id,
        title: `Ujian ${status}`,
        user_id: userId,
        school_id: schoolId,
        // 🔥 PERBAIKAN 2: Simpan durasi dari parameter ke dalam pangkalan data!
        duration: duration, 
        // expired_at: expiredAt, 
      }
    });
    }

  async seedQuestionBank(bankId: string, author_id: string) {
    await this.prisma.questionBank.create({
      data: {
        id: bankId,
        title: 'Bank Soal Skenario E2E',
        description: 'Deskripsi bank soal E2E',
        shared      : true,
        author_id : author_id,
      }
    })

    const questionBankId1 = `${bankId}-qb1`
    await this.prisma.bankQuestion.create({
      data: {
        id: questionBankId1,
        text: 'Berapa 1 + 1?',
        category: 'Matematika Dasar',
        type: 'MULTIPLE_CHOICE',
        question_bank_id: bankId
      }
    })

    const questionBankOptId1 = `${questionBankId1}-qbo01`
    await this.prisma.bankQuestionOption.create({
      data: {
        id: questionBankOptId1,
        label: 'Dua',
        score: 10,
        bank_question_id: questionBankId1
      }
    })

    const questionBankOptId2 = `${questionBankId1}-qbo02`
    await this.prisma.bankQuestionOption.create({
      data: {
        id: questionBankOptId2,
        label: '3',
        score: 0,
        bank_question_id: questionBankId1
      }
    })
  }

  async seedQuestiontBank(id: string) {

  }

  async seedQuestiontBankOption(id: string) {

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