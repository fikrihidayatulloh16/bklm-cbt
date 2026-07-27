// test/assessment.e2e-spec.ts
const request = require('supertest');
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { E2eSeeder } from './utils/e2e-seeder';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

describe('Assessment Controller (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let seeder: E2eSeeder;

  // Konstanta ID
  const SCHOOL_ID = 'school-assessment-test';
  const TEACHER_ID = 'teacher-assessment-test';
  const CLASS_ID = 'class-assessment-1';
  
  // Skenario ID Ujian
  const ID_SIAP_PUBLISH = 'assess-draft-ready';
  const ID_TANPA_DURASI = 'assess-draft-nodur';
  const ID_SUDAH_PUBLISH = 'assess-published';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    // 🔥 PERBAIKAN 1: Tambahkan ('jwt') agar persis dengan yang ada di Controller
    .overrideGuard(AuthGuard('jwt')) 
    .useValue({
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: TEACHER_ID, school_id: SCHOOL_ID }; 
        return true; 
      },
    })
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    seeder = new E2eSeeder(prisma);

    // 1. Bersihkan Data & Buat Master Kelas ('class-assessment-1')
    await seeder.cleanDatabase();
    await seeder.seedMasterData(SCHOOL_ID, TEACHER_ID, CLASS_ID);

    // 2. Siapkan Ujian Skenario 1
    // 🔥 Tambahkan CLASS_ID di akhir parameter
    await seeder.seedAssessment(ID_SIAP_PUBLISH, TEACHER_ID, SCHOOL_ID, 'DRAFT', 'ses-1', 90, CLASS_ID);

    // 3. Siapkan Ujian Skenario 2
    // 🔥 Tambahkan CLASS_ID di akhir parameter
    await seeder.seedAssessment(ID_TANPA_DURASI, TEACHER_ID, SCHOOL_ID, 'DRAFT', 'ses-2', 0, CLASS_ID);

    // 4. Siapkan Ujian Skenario 3 (Ini yang sebelumnya membuat server crash!)
    // 🔥 Tambahkan CLASS_ID di akhir parameter
    await seeder.seedAssessment(ID_SUDAH_PUBLISH, TEACHER_ID, SCHOOL_ID, 'ACTIVE', 'ses-3', 90, CLASS_ID);
  });

  afterAll(async () => {
    await seeder.cleanDatabase();
    await prisma.$disconnect();
    await app.close();
  });

  // --- SKENARIO PENGUJIAN ---

  describe('PATCH /assessments/:id/publish', () => {
    
    // Asumsi: Karena Anda memakai JwtAuthGuard, dalam E2E sungguhan kita perlu
    // mengirimkan Bearer Token. Jika Anda mematikan guard saat testing, 
    // kode di bawah akan langsung jalan.
    // .set('Authorization', 'Bearer <token>') <-- Tambahkan ini jika kena 401 Unauthorized

    it('1. Harus menolak jika ujian TIDAK DITEMUKAN (404)', () => {
      return request(app.getHttpServer())
        .patch('/assessments/id-ngasal-123/publish')
        .send({ classIds: [CLASS_ID] })
        .expect(404)
        .then((res) => {
          expect(res.body.message).toEqual("Ujian tidak ditemukan");
        });
    });

    it('2. Harus menolak jika DURASI BELUM DIATUR (400)', () => {
      return request(app.getHttpServer())
        .patch(`/assessments/${ID_TANPA_DURASI}/publish`)
        .send({ classIds: [CLASS_ID] })
        .expect(400)
        .then((res) => {
          expect(res.body.message).toEqual("Durasi ujian belum diatur");
        });
    });

    it('3. Harus menolak jika Ujian SUDAH DIPUBLISH (403)', () => {
      return request(app.getHttpServer())
        .patch(`/assessments/${ID_SUDAH_PUBLISH}/publish`)
        .send({ classIds: [CLASS_ID] })
        .expect(403)
        .then((res) => {
          expect(res.body.message).toEqual("Assessment sudaah di publish, silahkan tunggu hingga selesai");
        });
    });

    it('4. HARUS BERHASIL mempublish ujian DRAFT yang valid (200/201)', async () => {
      // 1. Eksekusi request
      await request(app.getHttpServer())
        .patch(`/assessments/${ID_SIAP_PUBLISH}/publish`)
        .send({ classIds: [CLASS_ID] })
        .expect(200) // NestJS PATCH default-nya 200 OK
        .then((res) => {
          expect(res.body.message).toEqual("Ujian berhasil di-publish");
        });

      // 2. VALIDASI KE DATABASE (Penting untuk E2E!)
      // Pastikan statusnya benar-benar berubah di database
      const updatedAssessment = await prisma.assessment.findUnique({
        where: { id: ID_SIAP_PUBLISH }
      });
      expect(updatedAssessment?.assessment_status).toBe('PUBLISHED');

      // 3. Pastikan Gateway Session benar-benar bekerja
      const createdSession = await prisma.assessmentSession.findFirst({
        where: { assessment_id: ID_SIAP_PUBLISH }
      });
      expect(createdSession).toBeDefined(); // Sesi harus terbuat!
    });
  });
});