import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { StartSubmissionDTO } from "../dto/start-submission.dto";
import { ISubmissionRepository } from "../ports/submission.repository.port";
import { SubmissionMapper } from "../mapper/submission.mapper";
import { SubmissionDomain } from "../entities/submission.entity";

@Injectable()
export class SubmissionRepository implements ISubmissionRepository {
    constructor(private prisma: PrismaService) {}

    async findDomainByStudent(assessmentId: string, studentName: string, className: string): Promise<SubmissionDomain | null> {
        const existing = await this.prisma.submission.findFirst({
          where: {
              assessment_id: assessmentId,
              student_name: studentName,
              // Jika di service Anda melempar class_id ke parameter ke-3 fungsi ini, 
              // pastikan query Prisma ini mencari berdasarkan field yang tepat!
              class_name: className, 
          },
        });

        if (!existing) return null;

        return new SubmissionDomain(
            existing.id,                                     // 1. id
            existing.assessment_id,                          // 2. assessmentId
            existing.student_name,                           // 3. studentName
            
            // 4. classId 
            // (Jika di tabel DB sudah ada class_id, gunakan existing.class_id. 
            // Jika belum ada, isi dengan string sementara atau samakan dengan nama)
            (existing as any).class_id || existing.class_name, 
            
            existing.class_name,                             // 5. className
            existing.status as 'IN_PROGRESS' | 'FINISHED',   // 6. status
            existing.session_id ?? undefined                 // 7. sessionId (ubah null jadi undefined)
        );
    }

    async createSubmission(
        assessmentId: string, 
        studentName: string, 
        classId: string,
        className: string, 
        gender: string,
        sessionId: string,
    ): Promise<SubmissionDomain> {
        // 🚨 PASANG KAMERA PENGINTAI DI SINI
    console.log("MENGIRIM KE PRISMA:", {
      assessment_id: assessmentId,
      session_id: sessionId, 
      student_name: studentName,
      class_name: className, 
      gender: gender
    });

        const record = await this.prisma.submission.create({
            data: {
            assessment_id: assessmentId,
            session_id: sessionId,
            student_name: studentName,
            class_name: className, 
            gender: gender,
            score: 0
            }
        });
        return SubmissionMapper.toDomain(record);
    }

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
                        // expired_at: true // Ambil deadline-nya sekalian
                    }
                }
            }
        });

        return SubmissionMapper.toDomain(record)
    }

    // 1. Kueri untuk mengambil data yang nyangkut
    async findStuckSubmissions(assessmentId: string): Promise<any[]> {
        return await this.prisma.submission.findMany({
        where: {
            assessment_id: assessmentId,
            status: 'IN_PROGRESS'
        },
        include: {
            answer: { include: { option: true } }, 
            session: true // 🔥 Pastikan tabel Submission punya relasi ke tabel AssessmentSession
        }
        });
    }

    // 2. Kueri untuk eksekusi update
    async forceFinishSubmission(submissionId: string, score: number): Promise<void> {
        await this.prisma.submission.update({
        where: { id: submissionId },
        data: {
            status: 'FINISHED',
            score: score,
            finish_method: 'FORCED',
            submitted_at: new Date()
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