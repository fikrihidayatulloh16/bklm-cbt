import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { StartSubmissionDTO } from "../dto/start-submission.dto";

@Injectable()
export class SubmissionRepository {
    constructor(private prisma: PrismaService) {}

    async createSubmission(dto: StartSubmissionDTO, assessment_id) {
        
        return await this.prisma.submission.create({
            data: {
                assessment_id: assessment_id,
                
                student_name: dto.student_name,
                gender: dto.gender,
                
                // PERUBAHAN DISINI: Ambil langsung dari DTO
                class_name: dto.class_name, 
                
                score: 0
            }
        }) 
    }

    async updateStatusFinishSubmission(submissionId: string, totalScore: number) {
        return await this.prisma.submission.update({
        where: { id: submissionId },
          data: {
            score: totalScore,
            status: 'FINISHED',
            submitted_at: new Date(),
          }
      })
    }

    async findSubmissionById(submissionId) {
        return await this.prisma.submission.findUnique({
        where: { id: submissionId },
        select : { assessment_id: true, status: true }
      })
    }

    async findOneSubmissionWithAnswer(submissionId) {
            return await this.prisma.submission.findUnique({
            where: { id: submissionId },
            include: { 
            answer:  {
                include: { option: true }
            }
            }
      })}

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