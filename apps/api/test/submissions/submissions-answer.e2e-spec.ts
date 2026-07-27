// apps/api/test/submissions/submissions-answer.e2e-spec.ts
const request = require('supertest');
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { E2eSeeder } from '../utils/e2e-seeder';

describe('PUT /submissions/:id/answer (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let seeder: E2eSeeder;

  const schoolId = 'school-ans-1';
  const userId = 'user-ans-1';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    
    prisma = app.get<PrismaService>(PrismaService);
    seeder = new E2eSeeder(prisma);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await seeder.cleanDatabase();
    
    // 🔥 1. Pastikan class-1 terbuat
    await seeder.seedMasterData('school-1', 'teacher-1', 'class-1');

    // 🔥 2. Buat Ujian & Sesi Aktif (Perhatikan argumen ke-5: 'ses-ans-active')
    await seeder.seedAssessment(
        'assess-ans-active', 'teacher-1', 'school-1', 'ACTIVE', 'ses-ans-active', 90, 'class-1'
    );
    
    // 🔥 3. Buat Ujian & Sesi Selesai (Perhatikan argumen ke-5: 'ses-ans-timeout')
    await seeder.seedAssessment(
        'assess-ans-timeout', 'teacher-1', 'school-1', 'TIMEOUT', 'ses-ans-timeout', 90, 'class-1'
    );

    // 4. Buat Soal
    await seeder.seedQuestion('question-1', 'assess-ans-active', 'MULTIPLE_CHOICE');
    await seeder.seedQuestionOption('option-A', 'question-1', 'Jawaban Benar', 10);
    await seeder.seedQuestion('question-nyasar', 'assess-ans-timeout', 'YES_NO');

    // 🔥 5. Buat Submission (Sambungkan ke argumen ke-4 yaitu ID Sesi yang tepat!)
    // Submission Aktif (Sambung ke ses-ans-active)
    await seeder.seedSubmission('sub-ans-active', 'assess-ans-active', 'IN_PROGRESS', 'ses-ans-active');
    
    // Submission yang sudah ditekan tombol Selesai (Sambung ke ses-ans-active)
    await seeder.seedSubmission('sub-ans-finished', 'assess-ans-active', 'FINISHED', 'ses-ans-active');
    
    // Submission yang waktunya habis (Sambung ke ses-ans-timeout)
    await seeder.seedSubmission('sub-ans-timeout', 'assess-ans-timeout', 'IN_PROGRESS', 'ses-ans-timeout');
  });

  it('✅ [SUCCESS] GIVEN submission aktif & soal valid, WHEN simpan jawaban, THEN return 201 (Created)', async () => {
    
    // 🔥 1. PAYLOAD HARUS SAMA DENGAN SEEDER
    const payload = {
      question_id: 'question-1', // BUKAN 'q-valid'
      option_id: 'option-A',     // BUKAN 'opt-valid'
      status_answer: true,
    };

    // 🔥 2. REQUEST MURNI TANPA .expect() BERANTAI
    const response = await request(app.getHttpServer())
      .put(`/submissions/sub-ans-active/answer`)
      .send(payload);
      // JANGAN KETIK .expect() DI SINI

    // 🔥 3. LOG DEBUGGING (Sekarang pasti muncul)
    if (response.status !== 201) {
      console.log('=== ERROR 404 DARI SERVICE ===');
      console.log('STATUS:', response.status);
      console.log('BODY:', response.body);
      console.log('==============================');
    }

    // 🔥 4. VALIDASI DILAKUKAN DI AKHIR
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Answer updated Successfully');
  });

  it('❌ [FAIL] GIVEN submission berstatus FINISHED, WHEN simpan jawaban, THEN return 403 (Forbidden)', async () => {
    const payload = {
      question_id: 'question-1', 
      option_id: 'option-A',
      status_answer: true,
    };

    const response = await request(app.getHttpServer())
      .put(`/submissions/sub-ans-finished/answer`)
      .send(payload)
      .expect(403);

    expect(response.body.message).toBe('Ujian sudah ditutup.'); // Pastikan pesan ini persis dengan yang di Service Anda
  });

  it('❌ [FAIL] GIVEN soal bukan milik ujian tersebut, WHEN simpan jawaban, THEN return 400 (Bad Request)', async () => {
    const payload = {
      question_id: 'question-nyasar', // 🔥 Samakan dengan ID di seeder ke-4
      option_id: 'option-A', // Opsional, sesuaikan jika ada seeder opsi-nya
      status_answer: true,
    };

    const response = await request(app.getHttpServer())
      .put(`/submissions/sub-ans-active/answer`) 
      .send(payload)
      .expect(400);

    expect(response.body.message).toBe('Pertanyaan ini bukan bagian dari ujian ini!');
  });

  it('❌ [FAIL] GIVEN waktu ujian > 2 menit dari expired_at, WHEN simpan jawaban, THEN return 403 (Waktu Habis)', async () => {
    const payload = {
      question_id: 'q-nyasar',
      option_id: 'opt-nyasar',
      status_answer: true,
    };

    const response = await request(app.getHttpServer())
      .put(`/submissions/sub-ans-timeout/answer`) // Waktu ujian ini sudah diatur mundur 3 menit di Seeder
      .send(payload)
      .expect(403);

    expect(response.body.message).toBe('Waktu ujian telah habis! Jawaban tidak tersimpan.');
  });
});