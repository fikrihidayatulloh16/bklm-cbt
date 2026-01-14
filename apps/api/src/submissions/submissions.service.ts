import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { StartSubmissionDTO } from './dto/start-submission.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SaveAnswerDTO } from './dto/save-answers,dto';
import { SubmissionRepository } from './repository/submissions.repositoy';

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  // Pastikan DTO Anda menerima 'class_name' (String), bukan 'class_id'
  async startSubmission(dto: StartSubmissionDTO) {
    
    // TIDAK PERLU: const classData = await this.prisma.class.findUnique... 
    // Kita percaya data teks yang dikirim dari Frontend

    const newSubmission = await this.prisma.submission.create({
      data: {
        assessment_id: dto.assessment_id,
        
        student_name: dto.student_name,
        gender: dto.gender,
        
        // PERUBAHAN DISINI: Ambil langsung dari DTO
        class_name: dto.class_name, 
        
        score: 0
      }
    });

    return {
      submission_id: newSubmission.id,
      student_name: newSubmission.student_name,
      class_name: newSubmission.class_name
    };
  }

  async saveAnswer(submissionId,dto: SaveAnswerDTO) {
      const existing = await this.prisma.answer.findFirst({
        where: {
          submission_id: submissionId,
          question_id: dto.question_id
        }
      })

      if (existing) {
        return await this.prisma.answer.update({
          where: { id: existing.id },
          data: {
            option_id: dto.option_id,
            text_value: dto.text_value,
          }
        })
      } else  {
        return await this.prisma.answer.create({
          data: {
            submission_id: submissionId,
            question_id: dto.question_id,
            option_id: dto.option_id,
            text_value: dto.text_value,
          }
        })
      }
    }

    async finish(submissionId: string) {
      const submission = await this.prisma.submission.findUnique({
        where: { id: submissionId },
        select : { assessment_id: true, status: true }
      })

      if (submission?.status === 'FINISHED') {
        throw new BadRequestException(`Submission sudah selesai dilakukan`)
      }

      const totalAnswered = await this.prisma.answer.count({
        where: { submission_id:submissionId }
      })

      const totalQuestion = await this.prisma.question.count({
        where: { assessment_id: submission?.assessment_id }
      })

      if (totalAnswered < totalQuestion) {
        const sisa = totalQuestion - totalAnswered;
        throw new BadRequestException(`Belum selesai! masih ada '${sisa}' soal lagi yang belum terjawab `)
      }

      const submissionWithAnswer = await this.prisma.submission.findUnique({
        where: { id: submissionId },
        include: { 
          answer:  {
            include: { option: true }
          }
        }
      })

      let totalScore = 0

      if (!submissionWithAnswer) {
        throw new NotFoundException('Data submission tidak ditemukan saat mau menghitung nilai.');
      }

      for (const a of submissionWithAnswer?.answer) {
        const score = a.option?.score ?? 0
        
        totalScore += score
      }

      return await this.prisma.submission.update({
        where: { id: submissionId },
          data: {
            score: totalScore,
            status: 'FINISHED',
            submitted_at: new Date(),
          }
      })
    }

  // findAll() {
  //   return `This action returns all submissions`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} submission`;
  // }

  // update(id: number, updateSubmissionDto: UpdateSubmissionDto) {
  //   return `This action updates a #${id} submission`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} submission`;
  // }
}
