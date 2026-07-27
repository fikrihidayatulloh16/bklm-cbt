const request = require('supertest');
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
// import * as request from 'supertest';
import { AppModule } from './../../src/app.module';
import { PrismaService } from './../../src/prisma/prisma.service';
import { E2eSeeder } from './../utils/e2e-seeder';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

describe('GET /assessments/:id/analytics (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let seeder: E2eSeeder;

  const SCHOOL_ID = '11111111-2222-3333-4444-555555555555';
  const TEACHER_ID = '22222222-3333-4444-5555-666666666666';
  const CLASS_ID = 'class-analytics-1';
  const ASSESS_ID = '33333333-4444-5555-6666-777777777777';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideGuard(AuthGuard('jwt')) 
    .useValue({
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        // Mock Guru yang login
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
    // 1. Bersihkan & siapkan data dasar
    await seeder.cleanDatabase();
    await seeder.seedMasterData(SCHOOL_ID, TEACHER_ID);

    // 2. Buat satu ujian PUBLISHED (durasi bebas, pakai default parameter kita yang hebat)
    await seeder.seedAssessment(ASSESS_ID, TEACHER_ID, SCHOOL_ID, 10, 'PUBLISHED');
    
    // Opsional: Jika Anda punya fungsi seedQuestion dan seedSubmission, 
    // Anda bisa memanggilnya di sini agar analitik punya data sungguhan.
    // Tapi untuk sekarang, kita uji dalam keadaan kosong (fresh).
  });

  // --- SKENARIO PENGUJIAN ---

  it('1. ✅ HARUS 200 & MENGEMBALIKAN DATA KOSONG JIKA BELUM ADA JAWABAN', async () => {
    const response = await request(app.getHttpServer())
      .get(`/assessments/${ASSESS_ID}/analytics`); 
      // Sesuaikan endpoint getAnalytics di Controller Anda (apakah /assessments/:id/analytics ?)

    // 🔥 CCTV ANTI-BURNOUT
    if (response.status !== 200) {
      console.log('🚨 TC01 GAGAL. RESPONS ASLI:');
      console.log(response.body);
    }

    expect(response.status).toBe(200);

    // Validasi bentuk objek (Response Shape) dari Mapper Anda
    expect(response.body).toHaveProperty('grand_total_problems');
    expect(response.body).toHaveProperty('question_analysis');
    expect(response.body).toHaveProperty('studentRanks');
    
    // Karena belum ada yang jawab, ekspektasinya adalah 0 / kosong
    expect(response.body.grand_total_problems).toBe(0);
    expect(Array.isArray(response.body.question_analysis)).toBeTruthy();
    expect(Array.isArray(response.body.studentRanks)).toBeTruthy();
  });

  it('2. ✅ HARUS 200 SAAT MENGGUNAKAN QUERY FILTER KELAS (?className=...)', async () => {
    // Menguji apakah Controller dan Service bisa memproses parameter kelas tanpa error
    const response = await request(app.getHttpServer())
      .get(`/assessments/${ASSESS_ID}/analytics?className=XII-RPL`);

    // 🔥 CCTV ANTI-BURNOUT
    if (response.status !== 200) {
      console.log('🚨 TC02 GAGAL. RESPONS ASLI:');
      console.log(response.body);
    }

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('question_analysis');
  });

});