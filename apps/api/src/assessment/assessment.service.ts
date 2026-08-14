// apps/api/src/assessment/assessment.service.ts
import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssessmentFromBankDto } from './dto/create/create-assessment-from-bank.dto';
import { QuestionBankRepository } from 'src/question-bank/repository/question-bank.repository';
import { Assessment } from './entities/assessment.entity';
import { AssessmentMapper } from './mapper/assessment.mapper';
import { AssessmentRepository } from './repository/assessment.repository';
import { SubmissionRepository } from 'src/submissions/repository/submissions.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import { I_QUESTION_BANK_GATEWAY, IQuestionBankGateway } from './port/question-bank.gateway.port';
import { I_ASSESSMENT_REPOSITORY, IAssessmentRepository } from './port/assessment.repository.interface';
import { I_CACHE_REPOSITORY, ICacheRepository } from 'src/common/cache/cache.repository.port';
import { I_SESSION_GATEWAY, ISessionGateway } from './port/session.gateway.port';
import { PublishAssessmentDto } from './dto/publish-assessment.dto';
import { I_SUBMISSION_GATEWAY, ISubmissionGateway } from './port/submission.gateway.port';

@Injectable()
export class AssessmentService {
  constructor(
    private prisma: PrismaService,
    private questionBankRepo: QuestionBankRepository,
    // private assessmentRepo: AssessmentRepository,
    private submissionsRepo: SubmissionRepository,

    @Inject(I_QUESTION_BANK_GATEWAY)
    private readonly qbGateway: IQuestionBankGateway,

    @Inject(I_SUBMISSION_GATEWAY)
    private readonly iSubmissionGateway: ISubmissionGateway,

    @Inject(I_ASSESSMENT_REPOSITORY)
    private readonly iassessmentRepo: IAssessmentRepository,

    @Inject(I_CACHE_REPOSITORY)
    private readonly cacheRepo: ICacheRepository, // 👈 Port disuntikkan

    @Inject(I_SESSION_GATEWAY)
    private readonly sessionGatewsy: ISessionGateway, // 👈 Port disuntikkan
  ) {}

  async createFromBank(dto: CreateAssessmentFromBankDto, userId: string, schoolId?: string) {
    // 1. AMBIL BAHAN BAKU (Lewat Gateway)
    // Walaupun user bisa melihat list bank pakai findAllByUserId di frontend,
    // Saat create, kita tetap butuh menarik detail 1 bank secara spesifik
    const bank = await this.qbGateway.findOneQbId(dto.question_bank_id);
    
    if (!bank) {
      throw new NotFoundException('Question Bank tidak ditemukan');
    }

    console.log('DTO: ', dto);
    console.log('userid: ', userId);
    console.log('schoolId: ', schoolId);
    

    try {
      // 2. BENTUK DOMAIN (Validasi durasi dll ada di dalam sini)
      const newAssessment = Assessment.createNew(dto.title, dto.duration, userId, schoolId);
      
      // Mapping dari bank ke format soal Assessment
      const mappedQuestions = AssessmentMapper.mapFromBankQuestions(bank.questions);
      newAssessment.attachQuestions(mappedQuestions);

      console.log('newAssessment: ', newAssessment);
      

      // 3. SIMPAN KE DB (Prisma akan mengisi UUID secara otomatis)
      const savedAssessment = await this.iassessmentRepo.createAssessmentFromBank(newAssessment);

      // Delete previous cache 
      if (savedAssessment) {
        await this.cacheRepo.invalidateByPattern(`assessments:list:user:${userId}*`);
      }

      return {
        message: 'Assessment berhasil dibuat',
        data: savedAssessment // Bisa dikembalikan langsung ke Controller!
      };

    } catch (error: any) {
      if (error.message.includes('DomainError')) {
        throw new BadRequestException(error.message.replace('DomainError: ', ''));
      }
      throw error;
    }
  }

  async publishAssessment(assessmentId: string, dto: PublishAssessmentDto) {
    console.log('assessment service fungsi publish assesment: ');
    console.log('dto:', dto);
    console.log('assessmentId: ', assessmentId);
    
    
    const assessment = await this.iassessmentRepo.findOneAssessmentByAssessmentId(assessmentId);
    if (!assessment) throw new NotFoundException("Ujian tidak ditemukan");

    console.log('di service this.publishAssessment: ', assessment);
    

    try {
      // 1. DOMAIN LOGIC DIRI SENDIRI: Ubah status Assessment
      assessment.publish();

      // 2. SIMPAN STATUS ASSESSMENT (Diri Sendiri)
      await this.iassessmentRepo.updateStatus(assessmentId, assessment.status);

      // 3. MINTA TOLONG TETANGGA BUATKAN SESI (Lewat Gateway/Port)
      await this.sessionGatewsy.createSessionForPublish(
        assessmentId,
        dto.session_name,
        assessment.durationMs,
        dto.class_ids
      );

      // 4. CACHE INVALIDATION
      await this.cacheRepo.invalidateByPattern(`assessments:list:user:${assessment.authorId}*`);
      await this.cacheRepo.invalidateByPattern(`sessions:active:class:${assessment.id}*`);

      return {
        message: "Ujian berhasil dipublish dan sesi telah dibuka."
      };

    } catch (error: any) {
      if (error.message.includes('DomainError')) {
        throw new BadRequestException(error.message.replace('DomainError: ', ''));
      }
      throw error;
    }
  }

  async getAnalytics(assessmentId: string, className?: string) {
    // 1. Ambil Ranking Siswa (Code lama, tetap dipakai)
    const studentRanks = await this.iassessmentRepo.getStudentRanks(assessmentId);

    // 2. AMBIL RAW DATA (Tetap sama)
    const rawAnswers = await this.iassessmentRepo.findmanyAnswerByAssessmentIdClassName(assessmentId, className);

    // 3. AGGREGATE DATA 
    const { statsMap, grandTotalProblems } = AssessmentMapper.mapAnswerStats(rawAnswers);

    // 4. FINAL FORMATTING & SORTING
    // Ubah Map kembali menjadi Array
    const statArray = Array.from(statsMap.values())

    const finalReport = AssessmentMapper.mapFinalReport(statArray, grandTotalProblems)

    const cacheKey = `sessions:active:class:${assessmentId}`;
    
    
    return {
        grand_total_problems: grandTotalProblems, // Info tambahan (826)
        question_analysis: finalReport,
        studentRanks
    };
  }

  

  async getDashboardStats(user_id) {
    // Simpan data Assessment beserta relasi Question & Option secara bersamaan
    return await this.iassessmentRepo.getAssessmentStats(user_id);
  }

  async findAssessmentResults(assessmentId: string, className?) {
    console.log('fungsi 1 halaman mengambil detail satu assessment');
    return await this.iassessmentRepo.findAssessmentResults(assessmentId, className);
  }

  async findStudentAnswerDetails(assessmentId: string, submissionId: string) {
    const assessment = await this.iassessmentRepo.findOneAssessmentWithDetail(assessmentId);

    console.log('findStudentAnswerDetails: ', assessment);
    

    // Memastikan melihat jawaban hanya pada saat assessment tidak PUBLISHED
    if (assessment?.assessment_status == 'PUBLISHED') {
      throw new ForbiddenException('Detail jawaban hanya dapat dilihat ketika assessment sudah ditutup.')
    }

    const rawData = await this.submissionsRepo.findStudentAnswerDetails(submissionId);

    if (!rawData) {
      throw new ForbiddenException('Detail jawaban hanya dapat dilihat ketika assessment sudah ditutup.')
    }

    const cleanJson = AssessmentMapper.mapStudentAnswerDetails(rawData)

    return cleanJson;
  }

  // mengambil semua assessment untuk dashboard
  async findAllAssessmentByIdUser(user_id) {
    return await this.iassessmentRepo.countAllAssessmentQuestionsByUserId(user_id);
  }

  async forceCloseTimeouts(assessmentId: string) {
    console.log('memasuki endpoint sinkron dan fungsi forceCloseTimeouts di assessment dengan id:', assessmentId);

    // 🔥 1. VALIDASI DOMAIN ASSESSMENT (Lakukan di sini!)
    const assessment = await this.iassessmentRepo.findAssessmentstatus(assessmentId);

    console.log('assessment: ', assessment);
    

    // Sesuaikan pesan error INI persis dengan ekspektasi E2E Test Anda
    if (!assessment || assessment.assessment_status === "PUBLISHED") {
      throw new ForbiddenException("Assessment harus ada dan dilarang sinkron saat PUBLISHED");
    }

    return await this.iSubmissionGateway.forceCloseSubmissions(assessmentId);
  }

  //mengambil assesment unik dan menghitung jumlah soal dan siswa submit
  async findOneAssessmentWithDetail(assessmentId: string) {
    const assessment = await this.iassessmentRepo.findOneAssessmentWithDetail(assessmentId);

    console.log('fungsi 2 halaman mengambil detail satu assessment');
    

    if (!assessment) {
      // Opsional: Throw error di sini atau di controller jika tidak ketemu return null;
      throw new NotFoundException(`Assessment dengan ID ${assessmentId} tidak ditemukan`);
    }

    const now = new Date(); // membuat waktu saat ini

  //   if (this.sessionGatewsy) {
  //     // 2. Masuk sini HANYA jika expired_at TIDAK NULL.
  //     // TypeScript jadi happy, karena dia tau di dalam blok ini expired_at aman.
      
  //     if (now.getTime() >= assessment.expired_at.getTime()) {
  //         // Update status jadi CLOSED
  //         await this.assessmentRepo.updateDeadlineAssessment(
  //             assessment.id, 
  //             assessment.expired_at, 
  //             'CLOSED' // Update status local variable juga biar return-nya benar
  //         );
  //         assessment.assessment_status = 'CLOSED'; 
  //     }
  // }

    return assessment;
  }

  async findOneAssessmentForExam(id: string) {
    const assessment = await this.iassessmentRepo.findOneAssessmentForExam(id)

      if (!assessment) throw new NotFoundException(`Ujian tidak ditemukan`);

      return assessment;
  }

  //Mengambil Daftar kelas dari assessment
  async getDistinctStudentClass(assessmentId: string) {
    return await this.iassessmentRepo.getDistinctStudentClass(assessmentId);
  }
}

// async forceCloseTimeouts(assessmentId: string) {

//     // Memastikan bahwa tidak boleh aksi jika asssessment berada dalam publish
//     const assessment = await this.assessmentRepo.findAssessmentstatus(assessmentId)

//     if (!assessment || assessment.assessment_status === "PUBLISHED") {
//       throw new ForbiddenException("Assessment harus ada dan dilarang sinkron saat PUBLISHED");
//     }

//     // 1. Ambil semua submission yang "nyangkut" (IN_PROGRESS)
//     const stuckSubmissions = await this.prisma.submission.findMany({
//       where: {
//         assessment_id: assessmentId,
//         status: 'IN_PROGRESS'
//       },
//       include: {
//         answer: { include: { option: true } }, // Butuh opsi untuk hitung nilai
//         assessment: true // Butuh expired_at
//       }
//     });

//     const now = new Date();
//     let closedCount = 0;

//     // 2. Proses secara Parallel (biar cepat)
//     const updatePromises = stuckSubmissions.map(async (sub) => {
      
//       // Tentukan deadline (Prioritas: User deadline -> Global expired_at)
//       const deadline = sub.assessment.expired_at;

//       if (!deadline) {
//         throw new BadRequestException(`expired_at yang dimasukkan:${deadline}`)       
//       }

//       // Cek apakah MEMANG sudah lewat waktu? (Buffer 1-2 menit jaga-jaga)
//       if (now.getTime() > deadline.getTime()) {
        
//         // A. Hitung Nilai (Logic yang sama dengan finish normal)
//         let totalScore = 0;
//         sub.answer.forEach(ans => {
//           totalScore += ans.option?.score ?? 0; // Ambil nilai dari Option
//         });

//         // B. Update ke Database
//         return this.prisma.submission.update({
//           where: { id: sub.id },
//           data: {
//             status: 'FINISHED',
//             score: totalScore,
//             finish_method: 'FORCED', // <--- Tanda bahwa ini ditutup paksa Guru/Sistem
//             submitted_at: now
//           }
//         });
//       }
//     });

//     // Tunggu semua proses selesai
//     const results = await Promise.all(updatePromises);
    
//     // Filter yang tidak null (yang berhasil di-close)
//     closedCount = results.filter(r => r !== undefined).length;

//     return { 
//       message: `Berhasil menutup paksa ${closedCount} siswa yang timeout.`,
//       processed: closedCount 
//     };
//   }