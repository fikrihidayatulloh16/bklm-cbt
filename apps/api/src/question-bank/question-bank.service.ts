import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuestionBankDto } from './dto/create/create-question-bank.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBankQuestionDto } from './dto/create/create-bankquestion.dto';
import { QuestionBankMapper } from './mapper/question-bank.mapper';
import { QuestionBankRepository } from './repository/question-bank.repository';
import { error } from 'console';
import { UpdateQuestionBankParams } from './helper/interfaces/question-bank.interface';
import { CacheTTL, I_CACHE_REPOSITORY, ICacheRepository } from 'src/common/cache/cache.repository.port';
// import { UpdateQuestionBankDto } from './dto/update-question-bank.dto';

@Injectable()
export class QuestionBankService {
  private readonly CACHE_LIST = (userId: string) => `question_banks:list:${userId}`;
  private readonly CACHE_DETAIL = (userId: string, questionBankId: string) => 
  `question_banks:detail:${userId}:${questionBankId}`;
  private readonly CACHE_PATTERN_ALL = (userId: string) => `*question_banks:*${userId}*`;

  constructor(
    private repo: QuestionBankRepository,

    @Inject(I_CACHE_REPOSITORY)
    private readonly cacheRepo: ICacheRepository,
  ) {}

  async createQuestionBank(dto: CreateQuestionBankDto, userId: string) {
    await this.ValidateQuestionLogic(dto.questions);

    const savedQuestionBank = await this.repo.createQuestionBank(dto, userId)

    // Delete previous cache 
    if (savedQuestionBank!) {
      await this.cacheRepo.invalidateAndNotify(
          this.CACHE_PATTERN_ALL(userId), // Hapus semua cache terkait user ini di modul assessment
          'question_banks',                  // Nama Entity yang dibawa ke Frontend
          userId                          // ID User untuk mencari Room Websocket
      );
    }

    return savedQuestionBank;
  }

  private ValidateQuestionLogic(questions: CreateBankQuestionDto[]) {
    for (const q of questions) {
      if (q.type == 'MULTIPLE_CHOICE') {
        const correctAnswers = q.options.filter((opt) => opt.score > 0).length;

        if ( correctAnswers === 0  ) {
          throw new BadRequestException(`Pertanyaan "${q.text}" minimal punya 1 jawaban yang benar`)
        } else if  (correctAnswers > 1 ) {
          throw new BadRequestException(`Pertanyaan "${q.text}" tidak boleh memiliki lebih dari 1 jawaban yang benar`)
        } 
        // else if (q.options.find((opt) => opt.score > 0)) {
        //   throw new BadRequestException(`Pertanyaan "${q.text}" jawaban yang benar hanya bernilai 1`)
        // }
      } if (q.type == 'SCALE') {
        if ( q.options.length < 2 ) { throw new BadRequestException(`Pertanyaan "${q.text}" minimal punya 2 jawaban skala`) }
      }
    }
  }

  async updateQuestionBank(userId: string, questionBankId: string, params: UpdateQuestionBankParams) {
    // Cek dulu barangnya ada gak (Penting untuk Update)
    const existing = await this.repo.findOnlyQuestionBank(questionBankId);
    if (!existing) throw new NotFoundException('Question Bank tidak ditemukan');

    const updatedQuestionBank = await this.repo.updateWithNestedTransaction(questionBankId, params);

    if (updatedQuestionBank!) {
      await this.cacheRepo.invalidateAndNotify(
          this.CACHE_PATTERN_ALL(userId), // Hapus semua cache terkait user ini di modul assessment
          'question_banks',                 // Nama Entity yang dibawa ke Frontend
          userId                          // ID User untuk mencari Room Websocket
      );
    }

    // Panggil Repo untuk melakukan operasi database yang rumit
    return updatedQuestionBank
  }

  async findAllByAuthor(userId: string) {
    const list = await this.repo.findAllQuestionBankById(userId)

    console.log('listQB: ', list);
    

    return this.cacheRepo.getOrSet(
      this.CACHE_LIST(userId),
      async () => {
        // Ingat! Di dalam findById ini, Prisma WAJIB menggunakan "include: { classes: true }"
        // agar Domain memiliki array of classId
        return list;
      },
      CacheTTL.LONG_LIVED // TTL 1 menit
    );
  }

  async findOne(userId, questionBank_id) {
    return await this.cacheRepo.getOrSet(
      this.CACHE_DETAIL(userId, questionBank_id),
      
      // 👇 Fungsi ini (Callback) HANYA akan dieksekusi JIKA cache tidak ditemukan / expired!
      async () => {
        // Panggil database di dalam sini!
        return await this.repo.findUniqueQuestionBank(questionBank_id);
      },
      
      CacheTTL.LONG_LIVED // TTL
    );
  }

  async removeOneQuestionBank(userId: string, questionBankId: string) {
    // 1. Cukup SATU kali call DB
    const questionBank = await this.repo.findOnlyQuestionBank(questionBankId);

    // 2. Cek Eksistensi (404 Not Found lebih tepat daripada BadRequest)
    if (!questionBank) {
      throw new NotFoundException("Question bank tidak ditemukan");
    }

    // 3. Cek apakah SUDAH dihapus sebelumnya (Logic Bug Fixed)
    // Asumsi field di DB adalah 'deleted_at' (Date | null)
    if (questionBank.deleted_at !== null) {
      throw new BadRequestException("Question Bank sudah dihapus sebelumnya");
    }

    const deletedQuestionBank = await this.repo.softRemoveOneQuestionBank(questionBankId)

    if (deletedQuestionBank!) {
      await this.cacheRepo.invalidateAndNotify(
          this.CACHE_PATTERN_ALL(userId), // Hapus semua cache terkait user ini di modul assessment
          'question_banks',                 // Nama Entity yang dibawa ke Frontend
          userId                          // ID User untuk mencari Room Websocket
      );
    }

    // 4. Eksekusi
    return deletedQuestionBank;
  }
}
