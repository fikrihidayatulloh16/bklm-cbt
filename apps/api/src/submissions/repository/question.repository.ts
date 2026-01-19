import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class QuestionRepository {
    constructor(private prisma: PrismaService) {}

    async totalAnswered(assessment_id){
        return await this.prisma.question.count({
            where: { assessment_id: assessment_id }
        }) 
    }

    async findUniqueQuestion(question_id) {
        return await this.prisma.question.findUnique({
          where: { id: question_id }
      });
    }

    async findquestionOptionById(option_id: string, question_id: string) {
        return await this.prisma.questionOption.findFirst({
              where: {
                  id: option_id,
                  question_id: question_id // Pastikan opsi milik pertanyaan itu
              }
          });
    }
}