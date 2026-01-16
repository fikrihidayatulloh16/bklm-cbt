import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

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

    async createAnswer(submissionId, question_id, option_id, text_value) {
        return await this.prisma.answer.create({
          data: {
            submission_id: submissionId,
            question_id: question_id,
            option_id: option_id,
            text_value: text_value,
          }
        })
    }

    async updateAnswer(existing_id, option_id, text_value) {
        return await this.prisma.answer.update({
          where: { id: existing_id },
          data: {
            option_id: option_id,
            text_value: text_value,
          }
        })
    }

    async totalAnswered(submissionId: string){
        return await this.prisma.answer.count({
            where: { submission_id:submissionId }
        }) 
    }
}