import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuestionBankDto } from './dto/create/create-question-bank.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBankQuestionDto } from './dto/create/create-bankquestion.dto';
import { QuestionBankMapper } from './mapper/question-bank.mapper';
import { QuestionBankRepository } from './repository/question-bank.repository.ts';
import { error } from 'console';
import { UpdateQuestionBankParams } from './helper/interfaces/question-bank.interface';
// import { UpdateQuestionBankDto } from './dto/update-question-bank.dto';

@Injectable()
export class QuestionBankService {
  constructor(
    private repo: QuestionBankRepository
  ) {}

  async createQuestionBank(dto: CreateQuestionBankDto, userId: string) {
    this.ValidateQuestionLogic(dto.questions);

    return await this.repo.createQuestionBank(dto, userId)
  }

  async updateQuestionBank(questionBankId: string, params: UpdateQuestionBankParams) {
    // Cek dulu barangnya ada gak (Penting untuk Update)
    const existing = await this.repo.findOnlyQuestionBank(questionBankId);
    if (!existing) throw new NotFoundException('Question Bank tidak ditemukan');

    // Panggil Repo untuk melakukan operasi database yang rumit
    return this.repo.updateWithNestedTransaction(questionBankId, params);
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

  async findAllByAuthor(author_id) {
    const questionBanks = await this.repo.findAllQuestionBankById(author_id)
    
    return questionBanks
  }

  findOne(questionBank_id) {
    const bankquestion = this.repo.findUniqueQuestionBank(questionBank_id)

    return bankquestion
  }

  async removeOneQuestionBank(questionBankId: string) {
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

    // 4. Eksekusi
    return this.repo.softRemoveOneQuestionBank(questionBankId);
  }
}
