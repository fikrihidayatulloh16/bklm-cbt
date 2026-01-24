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
        select : { assessment_id: true, status: true },
      })
    }

    async findExistingStudent(assessmentId, studentName, className) {
        return await this.prisma.submission.findFirst({
            where: { 
                assessment_id: assessmentId,
                student_name: studentName,
                class_name: className
            }
        })
    }

    async findOneIdSubmissionWithAnswer(submissionId) {
            return await this.prisma.submission.findUnique({
            where: { id: submissionId },
            include: { 
                answer:  {
                    include: { 
                        option: true }
                },
                
            }
      })}

      async findOneSubmissionWithQuestion(submissiondId: string) {
        return this.prisma.submission.findUnique({
            where: { id: submissiondId },
            include: {
            // 👇 WAJIB ADA: Agar jawaban siswa ikut terambil
            answer: true, 

            // Ini yang sudah ada sebelumnya (Soal ujian)
            assessment: {
                include: {
                    questions: {
                        include: {
                            options: true
                        }
                    }
                }
            }
            },
        })
      }

    // submission.repository.ts
    async findSubmissionNAssessmentDeadline(id: string) {
    return this.prisma.submission.findUnique({
        where: { id },
        include: {
        assessment: { // <--- WAJIB INCLUDE INI
            select: {
                id: true,
                expired_at: true // Ambil deadline-nya sekalian
            }
        }
        }
    });
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