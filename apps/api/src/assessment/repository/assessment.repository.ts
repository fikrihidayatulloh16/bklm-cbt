import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateAssessmentDto } from "../dto/create/create-assessment.dto";
import { Prisma, PrismaClient } from "@prisma/client";
import { CreateAssessmentFromBankDto } from "../dto/create/create-assessment-from-bank.dto";
import { connect } from "http2";
import { Assessment } from "../entities/assessment.entity";

@Injectable()
export class AssessmentRepository {
    constructor(private prisma: PrismaService) {}

    async getAssessmentStats(userId: string) {
        // Jalankan 4 Query secara PARALEL
    const [
      totalAssessment,
      totalQuestionBank,
      totalQuestion,
      totalSubmissions
    ] = await Promise.all([
      
      // 1. Hitung Total Ujian milik Guru ini
      this.prisma.assessment.count({
        where: { user_id: userId }, // Sesuaikan field relation di DB Anda
      }),

      // 2. Hitung Total Bank Soal milik Guru ini
      this.prisma.questionBank.count({
        where: { author_id: userId, deleted_at: null},
      }),

      // 3. Hitung Total Butir Soal (Opsional: Bisa hitung dari tabel Question langsung)
      this.prisma.question.count({
        where: { 
          // Ambil soal yang ada di dalam Bank Soal milik Guru ini
          assessment: {user_id: userId}
        },
      }),

      // 4. Hitung Total Siswa yang Mengerjakan (Submissions)
      // Asumsi: Anda punya tabel AssessmentSubmission atau StudentResult
      this.prisma.submission.count({
        where: {
          assessment: { user_id: userId }
        }
      }),
    ]);

    // Return format sesuai Interface Frontend (DashboardStats)
        return {
        totalAssessment,
        totalQuestionBank,
        totalQuestion,
        totalSubmissions,
        };
    }

    async updateDeadlineAssessment(assessment_id: string, globalDeadLine, assessment_status) {
        return await this.prisma.assessment.update({
            where: { id: assessment_id },
            data: {
                assessment_status: assessment_status,
                expired_at: globalDeadLine
            }
        })
    }

    async getDistinctStudentClass(assessmentId: string) {
        const results = await this.prisma.submission.groupBy({
            by: ['class_name'],
            where: {
                assessment_id: assessmentId,
                // Opsional: Filter agar tidak mengambil data corrupt yang class_name-nya null
                class_name: { not: '' } 
            },
            orderBy: {
                class_name: 'asc' // Bonus: Urutkan abjad biar rapi di Dropdown
            }
        });

        // TRANSFORMASI DATA:
        // Ubah [{class_name: "A"}, {class_name: "B"}] menjadi ["A", "B"]
        return results.map(row => row.class_name);
    }

    async findmanyAnswerByAssessmentIdClassName(assessmentId: string, className?: string) {
        return await this.prisma.answer.findMany({
        where: {
            submission: { 
                assessment_id: assessmentId,
                ...(className && { class_name: className }),
                status: 'FINISHED' // Pastikan hanya yang selesai
            }
        },
        include: {
            option: { select: { score: true } }, 
            question: { select: { id: true, text: true, category: true } }
        }
    });
    }

    // Fungsi baru ini menggantikan createAssessmentFromBank yang lama
    async save(assessmentDomain: Assessment): Promise<any> {

    // Gunakan kode andalan Anda, tapi datanya diambil dari Entity!
    return await this.prisma.assessment.create({
        data: {
        title: assessmentDomain.title,
        
        // ⚠️ Catatan: Jika description mau dipakai, pastikan Anda 
        // menambahkannya ke parameter Assessment.createNew di Domain Entity ya!
        description: assessmentDomain.description, 
        
        duration: assessmentDomain.durationMs, // Sudah aman divalidasi oleh Domain
        
        user: {
            connect: { id: assessmentDomain.authorId }
        },
        
        school: assessmentDomain.schoolId 
            ? { connect: { id: assessmentDomain.schoolId } } 
            : undefined,

        // Array soal yang sudah di-attach di Service, kita tarik dari Domain
        questions: {
            create: assessmentDomain.questions 
        }
        },
        include: {
        questions: {
            include: { options: true }
        }
        }
    });
    }

    async createAssessmentFromBank(assessment: Assessment) { // 👈 Hanya menerima 1 entitas utuh
    console.log('======= di assessment prisma repo =======');
    console.log('Author ID:', assessment.authorId);
    
    // 1. Petakan (Map) format pertanyaan dari Domain ke format Prisma Nested Create
    const questionsData = assessment.questions.map((q) => {
      let mappedOptions = [];

      // Cek apakah q.options itu ada dan merupakan ARRAY MURNI
      if (Array.isArray(q.options)) {
        mappedOptions = q.options.map((opt: any) => ({
          label: opt.label,
          score: opt.score,
        }));
      } 
      // Cek apakah q.options sudah berbentuk Prisma Object { create: [...] } akibat Mapper
      else if (q.options && Array.isArray(q.options.create)) {
        mappedOptions = q.options.create.map((opt: any) => ({
          label: opt.label,
          score: opt.score,
        }));
      }

      return {
        text: q.text,
        type: q.type,
        category: q.category,
        order: q.order || 1, // Beri nilai default jika order kosong
        options: {
          create: mappedOptions,
        },
      };
    });

    // 2. Simpan ke database menggunakan Getter dari Domain Entity
    return this.prisma.assessment.create({
      data: {
        title: assessment.title,
        description: assessment.description,
        duration: assessment.durationMs, // 👈 Menggunakan Getter durationMs
        
        // Relasi ke User (Author)
        user: {
          connect: { id: assessment.authorId },
        },

        // Relasi ke School (Hanya dikoneksikan jika schoolId ada)
        ...(assessment.schoolId && {
          school: {
            connect: { id: assessment.schoolId },
          },
        }),
        
        // Relasi ke Questions
        questions: {
          create: questionsData,
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });
  }

    async findDeadlineAssessment(assessmentId: string) {
        return await this.prisma.assessment.findFirst({
            where: { id: assessmentId },
            select: { expired_at: true, }
        })
    }

    async findAllAssessment(user_id) {
        return await this.prisma.assessment.findMany({
            where: {user_id: user_id},
            include: { questions: true },
            orderBy: {
            created_at: 'desc'
            }
        })
    }

    async findAssessmentResults(assessmentId: string, className?: string) {
    return await this.prisma.assessment.findUnique({
      where: { 
        id: assessmentId,
    },
      include: {
        // Ambil daftar submission (lembar jawab siswa)
        submissions: {
            where: { ...(className && { class_name: className }) },
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

    async getStudentRanks(assessment_id: string) {
        return this.prisma.submission.findMany({
            where: {
                assessment_id: assessment_id,
                status: "FINISHED"
            },
            select: {
                id: true,
                student_name: true,
                class_name: true,
                score: true
            },
            orderBy: { score: 'desc' }
        })
    }

    async countAllAssessmentQuestionsByUserId(user_id: string) {
        return await this.prisma.assessment.findMany({
            where: { user_id: user_id },
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

    async findAssessmentstatus(assessmentId : string) {
        return await this.prisma.assessment.findUnique({
            where: { id: assessmentId },
            select: {assessment_status : true}
        })
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

    async findStudentAnswerDetails(submissionId: string) {
        return await this.prisma.answer.findMany({
            where: { submission_id: submissionId },
            include: {
                question: true,
                option: true,
                submission: {  }
            },
        })
    }
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