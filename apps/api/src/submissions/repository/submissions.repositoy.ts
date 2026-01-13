import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

export class SubmissionRepository {
    constructor(private prisma: PrismaService) {}

    async createSubmission(data: Prisma.SubmissionCreateInput) {
        return await this.prisma.submission.create({ data }) 
    }

    // async updateAnswer()

    // async findClassById(id: string) {
    //     return await this.prisma.class.findUnique({
    //         where: { id }
    //     });
    // }

    // async findAnswerBySubmissionIdQuestionId (submissionId: string, questionId: string) {
    //     return await this.prisma.answer.findFirst({
    //         where: {
    //             submission_id: submissionId,
    //             question_id: questionId
    //         }
    //     })
    // }

    // async findAllquestionsByIdAssessmenst(id: string) {
    //     return await this.prisma.assessment.findMany({
    //         where: {  }
    //     })
    // }
}