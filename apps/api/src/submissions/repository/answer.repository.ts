import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { SaveAnswerDTO } from "../dto/save-answers,dto";

@Injectable()
export class AnswerRepository {
    constructor(
        private prisma: PrismaService,
    ) {}

    async findAnswerBySubmissionIdNQuestionId(submission_id, question_id) {
        return await this.prisma.answer.findFirst({
            where: {
            submission_id: submission_id,
            question_id: question_id
            }
        })
    }

    async createAnswer(submissionId, question_id, option_id, text_value, option_score) {
        return await this.prisma.answer.create({
          data: {
            submission_id: submissionId,
            question_id: question_id,
            option_id: option_id,
            text_value: text_value,
            numeric_value: option_score,
          }
        })
    }

    async updateAnswer(existing_id, option_id, text_value, option_score) {
        return await this.prisma.answer.update({
          where: { id: existing_id },
          data: {
            option_id: option_id,
            text_value: text_value,
            numeric_value: option_score
          }
        })
    }

    async totalAnswered(submissionId: string){
        return await this.prisma.answer.count({
            where: { submission_id:submissionId }
        }) 
    }

    // Di dalam AnswerRepository
    async upsertAnswer(submission_id, dto: SaveAnswerDTO) {
    return this.prisma.answer.upsert({
        where: {
        // Pastikan di schema.prisma Anda punya @@unique([submission_id, question_id])
        submission_id_question_id: { 
            submission_id: submission_id,
            question_id: dto.question_id
        }
        },
        update: {
        option_id: dto.option_id,
        text_value: dto.text_value,
        numeric_value: dto.numeric_value,
        },
        create: {
        submission_id: submission_id,
        question_id: dto.question_id,
        option_id: dto.option_id,
        text_value: dto.text_value,
        numeric_value: dto.numeric_value,
        }
    });
    }

    async getGroupAllAnswerByQuestionId(assessmentId: string) {
        return await this.prisma.answer.groupBy({
            by: ['question_id'],
            where: {
                submission: {
                    assessment_id: assessmentId
                }
            },
            _sum: {
                numeric_value: true // Jumlahkan semua poin yang didapat siswa di soal ini
            },
            _count: {
                numeric_value: true // Berapa siswa yang menjawab
            },
            orderBy: {
                _sum: {
                    numeric_value: 'desc' // Soal dengan total poin tertinggi (Masalah Utama)
                }
            }
        })
    }
}