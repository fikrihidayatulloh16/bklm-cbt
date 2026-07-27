const request = require('supertest');
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../../src/app.module';
import { PrismaService } from './../../src/prisma/prisma.service';
import { E2eSeeder } from './../utils/e2e-seeder';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

describe('PATCH /assessments/:id/publish (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let seeder: E2eSeeder;

  // 🔥 Selalu gunakan format UUID untuk ID agar aman dari cegatan DTO @IsUUID() di parameter URL
  const SCHOOL_ID = '11111111-1111-1111-1111-111111111111';
  const TEACHER_ID = '22222222-2222-2222-2222-222222222222';
  const CLASS_ID = 'class-publish-1';
  
  const RANDOM_UUID = 'd290f1ee-6c54-4b01-90e6-d701748f0851'; // Untuk test 404
  const ID_TANPA_DURASI = '33333333-3333-3333-3333-333333333333';
  const ID_SUDAH_PUBLISH = '44444444-4444-4444-4444-444444444444';
  const ID_SIAP_PUBLISH = '55555555-5555-5555-5555-555555555555';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
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
  });

  afterAll(async () => {
    await seeder.cleanDatabase();
    await app.close();
  });

  beforeEach(async () => {
    // 1. Bersihkan arena & siapkan Master Data
    await seeder.cleanDatabase();
    await seeder.seedMasterData(SCHOOL_ID, TEACHER_ID);

    // 2. Siapkan Ujian tanpa durasi (Asumsi parameter ke-6 di seeder Anda adalah durasi)
    // Beri nilai 0 agar terdeteksi "belum diatur" oleh validasi !assessment.duration
    await seeder.seedAssessment(ID_TANPA_DURASI, TEACHER_ID, SCHOOL_ID, 0, 'DRAFT');

    // 3. Siapkan Ujian yang sudah dipublish (Perhatikan statusnya!)
    // Jika di seeder Anda tidak ada status PUBLISHED, pakai string langsung.
    await seeder.seedAssessment(ID_SUDAH_PUBLISH, TEACHER_ID, SCHOOL_ID, 10, 'PUBLISHED');

    // 4. Siapkan Ujian DRAFT yang sehat dan siap rilis
    await seeder.seedAssessment(ID_SIAP_PUBLISH, TEACHER_ID, SCHOOL_ID, 10, 'DRAFT');
  });

  // --- SKENARIO PENGUJIAN ---

  it('1. ❌ HARUS 404 JIKA UJIAN TIDAK DITEMUKAN', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/assessments/${RANDOM_UUID}/publish`); // Tidak perlu .send(payload) karena parameter via URL

    if (response.status !== 404) {
      console.log('🚨 JARING 404 GAGAL. RESPONS ASLI:');
      console.log(response.body);
    }

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Ujian tidak ditemukan");
  });

  it('2. ❌ HARUS 400 JIKA DURASI UJIAN BELUM DIATUR', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/assessments/${ID_TANPA_DURASI}/publish`);

    if (response.status !== 400) {
      console.log('🚨 JARING 400 GAGAL. RESPONS ASLI:');
      console.log(response.body);
    }

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Durasi ujian belum diatur");
  });

  it('TC03. ❌ HARUS 403 JIKA UJIAN SUDAH DIPUBLISH', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/assessments/${ID_SUDAH_PUBLISH}/publish`);

    if (response.status !== 403) {
      console.log('TC03 JARING 403 GAGAL. RESPONS ASLI:');
      console.log(response.body);
    }

    expect(response.status).toBe(403);
    // Hati-hati dengan typo di kode service Anda: "sudaah"
    expect(response.body.message).toBe("Assessment sudaah di publish, silahkan tunggu hingga selesai"); 
  });

  it('4. ✅ HARUS SUKSES MEMPUBLISH UJIAN', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/assessments/${ID_SIAP_PUBLISH}/publish`);

    // Patch di NestJS biasanya mengembalikan 200 secara default (bukan 201)
    if (response.status !== 200) {
      console.log('🚨 JARING SUKSES GAGAL. RESPONS ASLI:');
      console.log(response.body);
    }

    expect(response.status).toBe(200);
    
    // 🔥 VALIDASI KE DATABASE (Ini esensi sejati dari E2E!)
    // Kita harus memastikan fungsi Anda benar-benar mengubah data di tabel PostgreSQL
    const updatedAssessment = await prisma.assessment.findUnique({
      where: { id: ID_SIAP_PUBLISH }
    });

    // Pastikan status berubah
    expect(updatedAssessment?.assessment_status).toBe('PUBLISHED');
    // Pastikan tenggat waktu (deadline) sudah terisi
    expect(updatedAssessment?.expired_at).toBeDefined();
    expect(updatedAssessment?.expired_at).not.toBeNull();
  });

});