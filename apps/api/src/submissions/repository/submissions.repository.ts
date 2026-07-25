import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { StartSubmissionDTO } from "../dto/start-submission.dto";
import { ISubmissionRepository } from "../ports/submission.repository.port";
import { SubmissionDomain } from "../submission.domain";
import { SubmissionMapper } from "../mapper/submission.mapper";

@Injectable()
export class SubmissionPrismaRepository implements ISubmissionRepository {
    constructor(private prisma: PrismaService) {}

    async findDomainByStudent(assessmentId: string, studentName: string, className: string): Promise<SubmissionDomain | null> {
    // 💡 Ini adalah query bawaan dari kode lama Anda
    const existing = await this.prisma.submission.findFirst({
      where: {
        assessment_id: assessmentId,
        student_name: studentName,
        class_name: className,
      },
    });

    if (!existing) return null;

    // Mapper: Mengubah format Database (Prisma) menjadi format Bisnis (Domain)
    return new SubmissionDomain(
      existing.id,
      existing.assessment_id,
      existing.student_name,
      existing.class_name,
      existing.status as 'IN_PROGRESS' | 'FINISHED',
    //   existing.session_id // Pastikan skema prisma Anda punya session_id
    );
  }

    async createSubmission(
        assessmentId: string, 
        studentName: string, 
        className: string, 
        gender: string
    ): Promise<SubmissionDomain> {
        const record = await this.prisma.submission.create({
            data: {
            assessment_id: assessmentId,
            student_name: studentName,
            gender: gender,
            class_name: className, 
            score: 0
            }
        });
        return SubmissionMapper.toDomain(record);
    }

    // async findDomainByStudent

    async updateStatusFinishSubmission(submissionId: string, totalScore: number): Promise<SubmissionDomain> {
        const record = await this.prisma.submission.update({
            where: { id: submissionId },
                data: {
                score: totalScore,
                status: 'FINISHED',
                submitted_at: new Date(),
            }
        })
        return SubmissionMapper.toDomain(record); 
    }

    async findSubmissionById(submissionId): Promise<SubmissionDomain> {
        const record = await this.prisma.submission.findUnique({
            where: { id: submissionId },
            select : { assessment_id: true, status: true },
        })
        return SubmissionMapper.toDomain(record);
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

    async findOneIdSubmissionWithAnswer(submissionId): Promise<SubmissionDomain> {
        const record = await this.prisma.submission.findUnique({
            where: { id: submissionId },
            include: { 
                answer:  {
                    include: { 
                        option: true }
                },
                
            }
        })
            return SubmissionMapper.toDomain(record)
    }

      async findOneSubmissionWithQuestion(submissiondId: string): Promise<SubmissionDomain> {
        const record = await this.prisma.submission.findUnique({
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
        return SubmissionMapper.toDomain(record) ;
      }

    async findStudentAnswerDetails(submissionId: string) {
        return await this.prisma.submission.findUnique({
            where: { id: submissionId },
            select: {
                // 1. Ambil data siswa
                student_name: true,
                gender: true,
                score: true,
                
                // 2. Ambil judul assessment dan list soalnya saja (Tanpa SEMUA opsi)
                assessment: {
                    select: {
                        title: true,
                        questions: {
                            select: {
                                id: true, // Butuh ID untuk dicocokkan dengan jawaban nanti
                                text: true,
                                category: true,
                                type: true,
                                // label: true,
                            }
                        }
                    }
                },

                // 3. Ambil jawaban siswa, dan LANGSUNG ambil label & skor dari opsi yang dia pilih
                answer: {
                    select: {
                        question_id: true,
                        text_value: true, // Untuk jaga-jaga kalau tipe soalnya Essay
                        option: {
                            select: {
                                label: true,
                                score: true
                            }
                        }
                    }
                }
            }
        });
    }

    // submission.repository.ts
    async findSubmissionNAssessmentDeadline(id: string): Promise<SubmissionDomain> {
        const record = await this.prisma.submission.findUnique({
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

        return SubmissionMapper.toDomain(record)
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