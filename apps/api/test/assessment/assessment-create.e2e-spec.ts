const request = require('supertest');
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../../src/app.module';
import { PrismaService } from './../../src/prisma/prisma.service';
import { E2eSeeder } from './../utils/e2e-seeder';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

describe('POST /assessments/from-bank (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let seeder: E2eSeeder;

  const SCHOOL_ID = 'school-create-1';
  const TEACHER_ID = 'teacher-create-1';
  const VALID_BANK_ID = 'd290f1ee-6c54-4b01-90e6-d701748f0834';
  const RANDOM_UUID = 'd290f1ee-6c54-4b01-90e6-d701748f0851';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideGuard(AuthGuard('jwt')) 
    .useValue({
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        // Suntikkan guru yang akan membuat ujian
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
    // 1. Bersihkan arena
    await seeder.cleanDatabase();
    
    // 2. Siapkan User (Guru)
    await seeder.seedMasterData(SCHOOL_ID, TEACHER_ID);
    
    // 3. Siapkan Bank Soal yang valid (Asumsi Anda punya seedQuestionBank)
    // Jika fungsi ini belum ada di e2e-seeder.ts, Anda perlu membuatnya sebentar.
    await seeder.seedQuestionBank(VALID_BANK_ID, TEACHER_ID);
  });

  // 👇 GILIRAN ANDA UNTUK MENCOBA 👇
  
  it('1. ❌ HARUS 404 JIKA BANK SOAL TIDAK DITEMUKAN', async () => {
    const payload = {
      title: 'Ujian Uji Coba',
      question_bank_id: RANDOM_UUID,
      duration: 90,
    };

    // 1. Tembak endpoint murni TANPA .expect(...)
    const response = await request(app.getHttpServer())
      .post('/assessments/from-bank')
      .send(payload);

    // 2. Sekarang aplikasi tidak akan crash duluan, kita bisa baca isinya!
    if (response.status === 400) {
      console.log('🚨 ALASAN ERROR 400 DARI NESTJS:');
      console.log(response.body); // Cetak seluruh body agar terlihat jelas
      console.log('-----------------------------------');
    }

    // 3. Validasi dengan Jest murni di akhir
    expect(response.status).toBe(404);
  });

  it('2. ❌ HARUS GAGAL, DURASI YANG DIMASUKKAN TIDAK SESUAI (MINUS)', async () => {
    const payload = {
      title: 'Ujian Uji Coba',
      // 🔥 1. Gunakan ID yang valid agar lolos validasi 404
      question_bank_id: VALID_BANK_ID, 
      duration: -10, // 🔥 2. Sengaja dibuat minus
    };

    const response = await request(app.getHttpServer())
      .post('/assessments/from-bank')
      .send(payload);

    // 🔥 JARING PENGAMAN ANTI-BURNOUT!
    // Karena kita berharap mendapat status 400, maka jika BUKAN 400, kita print!
    if (response.status !== 400) {
      console.log('🚨 STATUS TIDAK SESUAI HARAPAN (Bukan 400):');
      console.log(response.body); 
      console.log('-----------------------------------');
    }

    // 3. Validasi dengan Jest murni
    expect(response.status).toBe(400); // Expect-nya 400 Bad Request, bukan 404
    
    // (Opsional) Anda bisa ngecek pesannya juga agar lebih presisi.
    // Tapi hati-hati, DTO (@IsPositive) mungkin akan mencegat ini duluan 
    // sebelum validasi manual Anda ("durasi wajib ada..."). 
    // Kita lihat saja nanti pesannya apa!
  });

  it('3. ✅ Harus 201 berhasil membuat assesment dengan bank soal dan durasi yang sesuai', async () => {
    const payload = {
      title: 'Ujian Uji Coba',
      question_bank_id: VALID_BANK_ID,
      duration: 10,
    };

    // 1. Tembak endpoint murni TANPA .expect(...)
    const response = await request(app.getHttpServer())
      .post('/assessments/from-bank')
      .send(payload);

    // 2. Sekarang aplikasi tidak akan crash duluan, kita bisa baca isinya!
    if (response.status !== 201) {
      console.log('🚨 ALASAN ERROR 400 DARI NESTJS:');
      console.log(response.body); // Cetak seluruh body agar terlihat jelas
      console.log('-----------------------------------');
    }

    // 3. Validasi dengan Jest murni di akhir
    expect(response.status).toBe(201);
  });
});