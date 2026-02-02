import { Test, TestingModule } from '@nestjs/testing';
import { QuestionBankRepository } from './repository/question-bank.repository.ts'; 
import { PrismaService } from '../prisma/prisma.service';

describe('QuestionBankRepository', () => {
  let repository: QuestionBankRepository;
  let prismaService: PrismaService;

  // 1. KITA BUAT MOCK TRANSACTION CLIENT (tx)
  // Ini adalah object pura-pura yang menggantikan 'tx' di dalam prisma.$transaction
  const mockTx = {
    questionBank: {
      update: jest.fn().mockResolvedValue({}),
      findUnique: jest.fn().mockResolvedValue({ id: 'parent-123' }), // Return dummy result
    },
    bankQuestion: {
      update: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({}),
    },
    bankQuestionOption: {
      deleteMany: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),
    },
  };

  // 2. MOCK PRISMA SERVICE UTAMA
  const mockPrismaService = {
    $transaction: jest.fn().mockImplementation((callback) => {
      // Kunci testing transaction: Langsung eksekusi callback-nya pakai mockTx
      return callback(mockTx);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionBankRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<QuestionBankRepository>(QuestionBankRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    
    jest.clearAllMocks(); // Reset hitungan panggilan function sebelum tiap test
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('updateWithNestedTransaction', () => {
    it('should handle Complex Surgical Update correctly', async () => {
      // DATA INPUT (Campuran update lama & insert baru)
      const inputId = 'parent-123';
      const inputParams: any = {
        title: 'Judul Baru',
        questions: [
          // SOAL 1: Update Soal Lama (Punya ID)
          {
            id: 'soal-lama-1',
            text: 'Soal Diedit',
            type: 'MULTIPLE_CHOICE',
            options: [
              { id: 'opt-lama-A', label: 'Label A', score: 1 }, // Update Opsi
              { label: 'Label B Baru', score: 0 } // Create Opsi Baru (Gak ada ID)
              // Opsi lama C tidak dikirim, harusnya terhapus otomatis
            ],
          },
          // SOAL 2: Insert Soal Baru (Gak punya ID)
          {
            text: 'Soal Baru Nih',
            type: 'ESSAY',
            options: [],
          },
        ],
      };

      // ACT (Jalankan fungsi)
      await repository.updateWithNestedTransaction(inputId, inputParams);

      // ASSERT (Periksa apakah logika berjalan benar)

      // 1. Cek Parent Update
      expect(mockTx.questionBank.update).toHaveBeenCalledWith({
        where: { id: inputId },
        data: expect.objectContaining({ title: 'Judul Baru' }),
      });

      // 2. Cek Soal Lama (Update)
      expect(mockTx.bankQuestion.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'soal-lama-1' } })
      );

      // 3. Cek Surgical Delete Option (Harus exclude opt-lama-A)
      expect(mockTx.bankQuestionOption.deleteMany).toHaveBeenCalledWith({
        where: {
          bank_question_id: 'soal-lama-1',
          id: { notIn: ['opt-lama-A'] }, // Opsi B & C yg tidak disebut akan dihapus
        },
      });

      // 4. Cek Update Opsi Lama
      expect(mockTx.bankQuestionOption.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'opt-lama-A' } })
      );

      // 5. Cek Create Opsi Baru (Label B)
      expect(mockTx.bankQuestionOption.create).toHaveBeenCalledWith(
        expect.objectContaining({ 
          data: expect.objectContaining({ label: 'Label B Baru', bank_question_id: 'soal-lama-1' }) 
        })
      );

      // 6. Cek Soal Baru (Insert)
      expect(mockTx.bankQuestion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ 
            text: 'Soal Baru Nih',
            question_bank_id: inputId 
          })
        })
      );
    });
  });
});