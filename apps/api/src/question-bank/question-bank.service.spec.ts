import { Test, TestingModule } from '@nestjs/testing';
import { QuestionBankService } from './question-bank.service';
// Import Repository Class Anda (bukan Prisma lagi)
import { QuestionBankRepository } from './repository/question-bank.repository.ts';

// 1. Kita buat "Stuntman" untuk Repository
const mockRepo = {
  findAll: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
  findAllQuestionBankById: jest.fn(),
  // tambahkan fungsi lain yg ada di repository jika perlu
};

describe('QuestionBankService', () => {
  let service: QuestionBankService;
  let repository: typeof mockRepo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionBankService,
        // 2. DI SINI KUNCINYA:
        // Saat Service minta QuestionBankRepository, kita kasih mockRepo
        {
          provide: QuestionBankRepository, 
          useValue: mockRepo,
        },
        // Kita TIDAK PERLU provide PrismaService lagi di sini,
        // karena Service sudah tidak ngobrol langsung sama Prisma.
        // Prisma itu urusannya Repository (yang sudah kita mock).
      ],
    }).compile();

    service = module.get<QuestionBankService>(QuestionBankService);
    repository = module.get(QuestionBankRepository);
  });

  it('Harus terdefinisi', () => {
    expect(service).toBeDefined();
  });

  describe('findAllQuestionBankById', () => {
    it('Harus mengembalikan array soal milik author tertentu', async () => {
      // A. ARRANGE (Siapkan Skenario)
      const author_id = "abc123_user_id"; // ID Dummy
      
      const hasilPalsu = [
        { id: '1', title: 'Matematika', description: 'Seru', authorId: author_id },
        { id: '2', title: 'Fisika', description: 'Susah', authorId: author_id },
        { id: '3', title: 123, description: 'Mengetahui kondisi kenyamanan belajar siswa', authorId: author_id },
      ];

      // 👇 KOREKSI: Panggil mockRepo, BUKAN prisma
      // Pastikan nama function di repository sesuai (misal: findAllByAuthor)
      mockRepo.findAllQuestionBankById.mockResolvedValue(hasilPalsu);

      // B. ACT (Jalankan Fungsi Asli)
      const result = await service.findAllByAuthor(author_id);

      // C. ASSERT (Cek Hasil)
      expect(result).toEqual(hasilPalsu);
      
      // 👇 PENTING: Cek apakah service melempar ID yang benar ke repository
      expect(mockRepo.findAllQuestionBankById).toHaveBeenCalledWith(author_id); 
    });

    it('Harus mengembalikan array kosong jika author tidak punya soal', async () => {
      // ARRANGE
      mockRepo.findAllQuestionBankById.mockResolvedValue([]); // Balikin kosong

      // ACT
      const result = await service.findAllByAuthor("user_baru");

      // ASSERT
      expect(result).toEqual([]); // Hasil harus array kosong
      expect(result.length).toBe(0); // Panjangnya 0
    });
  });
});