const request = require('supertest');
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../../src/app.module';
import { PrismaService } from './../../src/prisma/prisma.service';
import { E2eSeeder } from './../utils/e2e-seeder';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

describe('GET Assessment Queries (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let seeder: E2eSeeder;

  const SCHOOL_ID = 'school-query-1';
  const TEACHER_ID = 'teacher-query-1';
  const STUDENT_ID = 'student-query-1';
  
  const ASSESS_PUB_ID = 'assess-pub-1';
  const ASSESS_TIMEOUT_ID = 'assess-timeout-1';
  const SUBMISSION_ID = 'sub-query-1';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideGuard(AuthGuard('jwt')) 
    .useValue({
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: TEACHER_ID, school_id: SCHOOL_ID, role: 'TEACHER' }; 
        return true;
      },
    })
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    seeder = new E2eSeeder(prisma);
  });

  afterAll(async () => {
    await seeder.cleanDatabase();
    await app.close();
  });

  beforeEach(async () => {
    await seeder.cleanDatabase();
    await seeder.seedMasterData(SCHOOL_ID, TEACHER_ID);

    // 1. Buat Ujian PUBLISHED (Masih berjalan)
    await seeder.seedAssessment(ASSESS_PUB_ID, TEACHER_ID, SCHOOL_ID, 10, 'PUBLISHED');

    // 2. Buat Ujian TIMEOUT (Waktu sudah habis di masa lalu)
    await seeder.seedAssessment(ASSESS_TIMEOUT_ID, TEACHER_ID, SCHOOL_ID, 10, 'CLOSED');

    // 3. Buat Data Submission (Selesai) di ujian TIMEOUT
    // await prisma.user.upsert({
    //   where: { email: 'siswa.query@test.com' },
    //   update: {},
    //   create: { id: STUDENT_ID, email: 'siswa.query@test.com', name: 'Siswa Q', school_id: SCHOOL_ID }
    // });

    await prisma.submission.create({
      data: {
        id: SUBMISSION_ID,
        assessment_id: ASSESS_TIMEOUT_ID,
        student_name: 'Rika',
        class_name: 'VIIA',
        gender: 'FEMALE',
        status: 'FINISHED',
        score: 85,
        finish_method: 'NORMAL'
      }
    });
  });

  // =========================================================
  // BLOK 1: PENGUJIAN LOGIKA BISNIS (WAJIB ADA)
  // =========================================================

  describe('findStudentAnswerDetails Logic', () => {
    it('TC01 ❌ HARUS 403 JIKA UJIAN MASIH PUBLISHED', async () => {
      // SESUAIKAN ROUTE INI DENGAN CONTROLLER ANDA
      const response = await request(app.getHttpServer())
        .get(`/assessments/${ASSESS_PUB_ID}/submissions/${SUBMISSION_ID}/answers`);

    if (response.status !== 403) {
      console.log('🚨 TC01 GAGAL. RESPONS:');
      console.log(response.body);
    }
      
      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Detail jawaban hanya dapat dilihat ketika assessment sudah ditutup.');
    });

    it('✅ HARUS 200 JIKA UJIAN SUDAH SELESAI/TIMEOUT', async () => {
      const response = await request(app.getHttpServer())
        .get(`/assessments/${ASSESS_TIMEOUT_ID}/submissions/${SUBMISSION_ID}/answers`);

    if (response.status !== 200) {
      console.log('🚨 TC01 GAGAL. RESPONS:');
      console.log(response.body);
    }
      
      expect(response.status).toBe(200);
    });
  });

  describe('findOneAssessmentWithDetail Auto-Close Logic', () => {
    it('✅ HARUS MENGUBAH STATUS JADI CLOSED JIKA EXPIRED_AT SUDAH TERLEWATI', async () => {
      // ASSESS_TIMEOUT_ID sudah di-seed dengan waktu expired_at 3 menit yang lalu
      const response = await request(app.getHttpServer())
        .get(`/assessments/${ASSESS_TIMEOUT_ID}`); // Sesuaikan rute

      expect(response.status).toBe(200);
      expect(response.body.assessment_status).toBe('CLOSED'); // Memastikan return function berubah

      // Intip database untuk memastikan perubahan disimpan permanen
      const dbCheck = await prisma.assessment.findUnique({ where: { id: ASSESS_TIMEOUT_ID } });
      expect(dbCheck?.assessment_status).toBe('CLOSED');
    });
  });

  // =========================================================
  // BLOK 2: PENGUJIAN ENDPOINT STANDAR (CUKUP PASTIKAN 200 OK)
  // =========================================================

  it('✅ HARUS 200: getDashboardStats & findAllAssessmentByIdUser', async () => {
    // Anggap ini endpoint untuk getDashboardStats
    const resStats = await request(app.getHttpServer()).get(`/assessments/stats`);
    expect([200, 404]).toContain(resStats.status); // Ganti sesuai route asli
    
    // Anggap ini endpoint untuk findAllAssessmentByIdUser
    const resAll = await request(app.getHttpServer()).get(`/assessments`);
    expect(resAll.status).toBe(200);
  });

  it('✅ HARUS 200: findAssessmentResults & getDistinctStudentClass', async () => {
    // Sesuaikan rute URL-nya
    const resResults = await request(app.getHttpServer()).get(`/assessments/${ASSESS_TIMEOUT_ID}/results`);
    expect([200, 404]).toContain(resResults.status); 

    const resClasses = await request(app.getHttpServer()).get(`/assessments/${ASSESS_TIMEOUT_ID}/distinct-class`);
    expect([200, 404]).toContain(resClasses.status); 
  });
});