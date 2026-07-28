const request = require('supertest');
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../../src/app.module';
import { PrismaService } from './../../src/prisma/prisma.service';
import { E2eSeeder } from './../utils/e2e-seeder';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

// Asumsi route controller Anda adalah 'question-banks'
describe('POST /question-banks (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let seeder: E2eSeeder;

  const SCHOOL_ID = 'school-qb-1';
  const TEACHER_ID = 'teacher-qb-1';

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
    // Hanya butuh user guru untuk author_id
    await seeder.seedMasterData(SCHOOL_ID, TEACHER_ID);
  });

  // =========================================================
  // BLOK PENGUJIAN LOGIKA SOAL
  // =========================================================

  it('1. ❌ HARUS 400 JIKA MULTIPLE_CHOICE TIDAK PUNYA JAWABAN BENAR (SCORE > 0)', async () => {
    const payload = {
      title: 'Bank Soal 1',
      description: 'Ini valid',
      shared : true,
      questions: [
        {
          text: 'Siapa penemu lampu?',
          type: 'MULTIPLE_CHOICE',
          category: 'SEJARAH',
          order: 1,
          options: [
            { label: 'Edison', score: 0, order: 1, }, // Salah semua!
            { label: 'Tesla', score: 0, order: 1, }
          ]
        }
      ]
    };

    const response = await request(app.getHttpServer())
      .post('/question-bank') // Sesuaikan endpoint
      .send(payload);

    if (response.status !== 400) console.log('🚨 TC01 GAGAL:', response.body);
    
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('minimal punya 1 jawaban yang benar');
  });

  it('2. ❌ HARUS 400 JIKA MULTIPLE_CHOICE PUNYA LEBIH DARI 1 JAWABAN BENAR', async () => {
    const payload = {
      title: 'Bank Soal 2',
      description: 'Ini valid',
      shared : true,
      questions: [
        {
          text: 'Berapa 1+1?',
          type: 'MULTIPLE_CHOICE',
          order: 1,
          category: 'MATH',
          options: [
            { label: 'Dua', score: 1, order: 1, }, // Benar
            { label: 'Two', score: 1, order: 1, }  // Benar juga! (Tidak boleh)
          ]
        }
      ]
    };

    const response = await request(app.getHttpServer())
      .post('/question-bank')
      .send(payload);

    if (response.status !== 400) console.log('🚨 TC02 GAGAL:', response.body);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('tidak boleh memiliki lebih dari 1 jawaban yang benar');
  });

  it('3. ❌ HARUS 400 JIKA SOAL SCALE PUNYA KURANG DARI 2 OPSI', async () => {
    const payload = {
      title: 'Bank Soal 3',
      description: 'Ini valid',
      shared : true,
      questions: [
        {
          text: 'Seberapa suka Anda dengan koding?',
          type: 'SCALE',
          category: 'SURVEY',
          order: 1,
          options: [
            { label: 'Sangat Suka', score: 5, order: 1, } // Hanya 1 opsi!
          ]
        }
      ]
    };

    const response = await request(app.getHttpServer())
      .post('/question-bank')
      .send(payload);

    if (response.status !== 400) console.log('🚨 TC03 GAGAL:', response.body);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('minimal punya 2 jawaban skala');
  });

  it('4. ✅ HARUS 201 SUKSES MEMBUAT BANK SOAL JIKA SEMUA ATURAN DIIKUTI', async () => {
    const payload = {
      title: 'Bank Soal Valid',
      description: 'Ini valid',
      shared : true,
      questions: [
        {
          text: 'Apa ibukota Indonesia?',
          type: 'MULTIPLE_CHOICE',
          order: 1,
          category: 'GEOGRAFI',
          options: [
            { label: 'Jakarta', score: 1, order: 1, }, // 1 Benar
            { label: 'Bandung', score: 0, order: 1, }
          ]
        },
        {
          text: 'Tingkat stres Anda?',
          type: 'SCALE',
          order: 1,
          category: 'SURVEY',
          options: [
            { label: 'Rendah', score: 1, order: 1, },
            { label: 'Tinggi', score: 5, order: 1, }
          ] // 2 Opsi Scale
        }
      ]
    };

    const response = await request(app.getHttpServer())
      .post('/question-bank')
      .send(payload);

    if (response.status !== 201) {
      console.log('🚨 TC04 GAGAL RESPONS ASLI:');
      console.log(response.body);
    }

    expect(response.status).toBe(201);
    expect(response.body.statuscode).toBe(201); // Mengikuti penulisan di Controller Anda
    expect(response.body.message).toBe('QuestionBank Successfully Created');
    
    // Pastikan data tersimpan dengan mengecek ID
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.title).toBe('Bank Soal Valid');

    // Cek Database (Apakah soal dan opsi benar-benar terbuat berelasi?)
    const dbCheck = await prisma.questionBank.findUnique({
      where: { id: response.body.data.id },
      include: { questions: { include: { options: true } } }
    });

    expect(dbCheck).not.toBeNull();
    // Harus ada 2 soal
    expect(dbCheck?.questions.length).toBe(2); 
    // Author ID harus sesuai dengan JWT/AuthGuard
    expect(dbCheck?.author_id).toBe(TEACHER_ID); 
  });

});