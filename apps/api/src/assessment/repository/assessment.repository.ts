import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateAssessmentDto } from "../dto/create/create-assessment.dto";
import { Prisma, PrismaClient } from "@prisma/client";
import { CreateAssessmentFromBankDto } from "../dto/create/create-assessment-from-bank.dto";
import { connect } from "http2";

@Injectable()
export class AssessmentRepository {
    constructor(private prisma: PrismaService) {}

    async updateDeadlineAssessment(assessment_id: string, globalDeadLine) {
        return await this.prisma.assessment.update({
            where: { id: assessment_id },
            data: {
                assessment_status: 'PUBLISHED',
                expired_at: globalDeadLine
            }
        })
    }

    // async createOneAssessment(dto: CreateAssessmentDto, user_id) {
    //     return await this.prisma.assessment.create({
    //         data: {
    //             title: dto.title,
    //             description: dto.description,
    //             duration: dto.duration,

    //             // Relasi ke User (Penulis Soal)
    //             school: { connect: {id: dto.school_id}},

    //             // Relasi ke User (Penulis Soal)
    //             user: { connect: {id: user_id} },
    //         },
    //     });
    // }

    async createAssessmentFromBank(
        dto: CreateAssessmentFromBankDto,
        // Gunakan tipe dari Prisma agar VSCode bisa autocompletion
        questionsData: Prisma.QuestionCreateWithoutAssessmentInput[], 
        user_id: string
    ) {
        return this.prisma.assessment.create({
        data: {
            title: dto.title,
            description: dto.description,
            duration: dto.duration,
            
            // Relasi ke User (Penulis Soal)
            user: {
                connect: { id: user_id }
            },
            
            // Relasi ke Sekolah (Opsional)
            school: dto.school_id 
                ? { connect: { id: dto.school_id } } 
                : undefined,

            // Relasi Nested Create Questions
            questions: {
            create: questionsData // Data yang sudah dimapping di Service
            }
        },
        include: {
            questions: {
            include: { options: true }
            }
        }
        });
    }

    async findAllAssessment(user_id) {
    return await this.prisma.assessment.findMany({
        where: {user_id: user_id},
        orderBy: {
        created_at: 'desc'
        }
    })
  }

    async findAssessmentResults(assessmentId: string) {
    return await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        // Ambil daftar submission (lembar jawab siswa)
        submissions: {
          select: {
            id: true,
            student_name: true, // Ambil nama snapshot
            class_name: true,   // Ambil kelas snapshot
            score: true,        // Ambil nilai
            status: true,       // FINISHED / IN_PROGRESS
            submitted_at: true, // Kapan selesai
            // answers: false   // Gak perlu ambil jawaban detail dulu biar ringan
          },
          orderBy: {
              score: 'desc' // Urutkan dari nilai tertinggi (Ranking)
          }
        }
      }
    });
  }

    async findOneAssessmentWithDetail(id: string) {
        return await this.prisma.assessment.findUnique({
            where: { id },
            include: {
                // Kita include _count untuk mendapatkan jumlah relasi tanpa mengambil datanya
                _count: {
                    select: {
                        questions: true,   // Menghitung jumlah soal
                        submissions: true  // Menghitung jumlah siswa yang sudah submit
                    }
                }
            }
        });
    }

    async findOneAssessmentById(id: string) {
        return await this.prisma.assessment.findUnique({
            where: { id }
        });
    }

    async findOneAssessmentForExam(id: string) {
        return await this.prisma.assessment.findUnique({
            where: { id },
            include: {
                // PERBAIKAN: Ganti 'question_bank' menjadi 'questionBank'
                    questions: {
                    orderBy: { order: 'asc' },
                    include: {
                        options: {
                            select: {
                                id: true,
                                label: true
                                // score: false (Jangan diambil)
                            }
                        }
                    }
                }
            }
        })
    }
}