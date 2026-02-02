import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuestionBankDto } from '../dto/create/create-question-bank.dto';
import { QuestionBankMapper } from '../mapper/question-bank.mapper';
import { CreateBulkYesNoDto } from '../dto/create/create-bulk-question.dto';
import { UpdateQuestionBankParams } from '../helper/interfaces/question-bank.interface';

@Injectable()
export class QuestionBankRepository {
  constructor(private prisma: PrismaService) {}

  async createQuestionBank(dto: CreateQuestionBankDto, userId: string) {
    return await this.prisma.questionBank.create({
      data: {
        title: dto.title,
        description: dto.description,
        author_id: userId,
        questions: {
          create: QuestionBankMapper.toPrismaCreate(dto.questions),
        },
      },
    });
  }

  async updateWithNestedTransaction(questionBankId: string, params: UpdateQuestionBankParams) {
    return this.prisma.$transaction(async (tx) => {
      
      // 1. UPDATE PARENT
      const { questions, ...parentData } = params;
      
      await tx.questionBank.update({
        where: { id: questionBankId },
        data: parentData,
      });

      // 2. HANDLE NESTED QUESTIONS
      if (questions && questions.length > 0) {
        
        for (const q of questions) {
          
          if (q.id) {
            // ===========================================
            // LOGIKA "SURGICAL" UPDATE (Soal Lama) 🏳️
            // ===========================================
            
            // A. Update Data Soal
            await tx.bankQuestion.update({
              where: { id: q.id },
              data: {
                text: q.text,
                type: q.type as any,
              }
            });

            // B. Handle OPTIONS
            const incomingOptionIds = q.options
              .filter(opt => opt.id)
              .map(opt => opt.id);

            // DELETE: Hapus opsi yang tidak ada di list
            await tx.bankQuestionOption.deleteMany({
              where: {
                // 👇 PERBAIKAN 1: Pakai snake_case sesuai Error
                bank_question_id: q.id, 
                id: { notIn: incomingOptionIds as string[] }
              }
            });

            // UPSERT OPTIONS
            for (const opt of q.options) {
              if (opt.id) {
                // UPDATE Opsi Lama
                await tx.bankQuestionOption.update({
                  where: { id: opt.id },
                  data: {
                    label: opt.label,
                    score: opt.score,
                    // order: opt.order  <-- SAYA KOMENTAR KARENA KOLOM INI TIDAK ADA DI SCHEMA ANDA
                  }
                });
              } else {
                // CREATE Opsi Baru
                await tx.bankQuestionOption.create({
                  data: {
                    // 👇 PERBAIKAN 2: Pakai snake_case
                    bank_question_id: q.id, 
                    label: opt.label,
                    score: opt.score,
                    // order: opt.order <-- SAYA KOMENTAR JUGA
                  }
                });
              }
            }

          } else {
            // ===========================================
            // LOGIKA INSERT SOAL BARU (New Question) ⭐
            // ===========================================
            await tx.bankQuestion.create({
              data: {
                text: q.text,
                type: q.type as any,
                category: 'General',
                
                // 👇 PERBAIKAN 3: Pakai snake_case
                question_bank_id: questionBankId, 
                
                options: {
                  create: q.options.map(opt => ({
                    label: opt.label,
                    score: opt.score,
                    order: opt.order
                  }))
                }
              }
            });
          }
        }
      }
      
      return tx.questionBank.findUnique({
          where: { id: questionBankId },
          include: { questions: { include: { options: true } } }
      });
    });
  }
  

  // Fungsi ini mengembalikan data Bank Soal LENGKAP dengan anak-anaknya
  async findCompleteBank(id: string) {
    return await this.prisma.questionBank.findUnique({
      where: { id },
      include: {
        questions: {
          include: { options: true }, // Include options agar terbawa
        },
      },
    });
  }
  
  async findUniqueQuestionBank(id: string) {
    return await this.prisma.questionBank.findUnique({
      where: { id },
      include: { 
        questions: { 
          orderBy: { order: 'desc' },
          include: { options: true }
        }
      }
    })
  }

  async findOnlyQuestionBank(questionBankId: string) {
    return await this.prisma.questionBank.findUnique({
      where: { id: questionBankId },
    })
  }

  async findAllQuestionBankById(id:string) {
    return await this.prisma.questionBank.findMany({
      where: { author_id: id, deleted_at: null },
      orderBy: { created_at: 'desc' },
    })
  }

  async findOneDeletedQuestionBank(questionBankId: string) {
    return await this.prisma.questionBank.findFirst({
      where: { id: questionBankId }
    })
  }

  async softRemoveOneQuestionBank(questionBankId: string) {
    return await this.prisma.questionBank.update({
      where: { id: questionBankId },
      data: { deleted_at: new Date() }
    })
  }
}