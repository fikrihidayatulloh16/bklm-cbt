import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { StartSubmissionDTO } from './dto/start-submission.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SaveAnswerDTO } from './dto/save-answers,dto';
import { SubmissionRepository } from './repository/submissions.repository';
import { AssessmentRepository } from 'src/assessment/repository/assessment.repository';
import { AnswerRepository } from './repository/answer.repository';
import { QuestionRepository } from './repository/question.repository';

@Injectable()
export class SubmissionsService {
  constructor(
    private submissionRepo: SubmissionRepository,
    private assessmentrepo: AssessmentRepository,
    private answerRepo: AnswerRepository,
    private questionRepo: QuestionRepository
  ) {}

  // Pastikan DTO Anda menerima 'class_name' (String), bukan 'class_id'
  async startSubmission(dto: StartSubmissionDTO, assessment_id: string) {
    
    const findAssessmentById = this.assessmentrepo.findOneAssessmentById(assessment_id)
    
    if(!findAssessmentById) {
      throw new NotFoundException('Assessment not found!')
    }

    const newSubmission = await this.submissionRepo.createSubmission(dto, assessment_id);

    return {
      submission_id: newSubmission.id,
      student_name: newSubmission.student_name,
      class_name: newSubmission.class_name
    };
  }

  async saveAnswer(submissionId: string, dto: SaveAnswerDTO) {
      // const existing = await this.answerRepo.findAnswerBySubmissionIdNQuestionId(submissionId, dto.question_id);

      // if (existing) {
      //   return await this.answerRepo.updateAnswer(existing.id, dto.option_id, dto.text_value)
      // } else  {
      //   return await this.prisma.answer.create({
      //     data: {
      //       submission_id: submissionId,
      //       question_id: dto.question_id,
      //       option_id: dto.option_id,
      //       text_value: dto.text_value,
      //     }
      //   })
      // }
    }

    async finish(submissionId: string) {

      //Mencari dulu apakah responded sudah submission
      const submission = await this.submissionRepo.findSubmissionById(submissionId)
      if (submission?.status === 'FINISHED') {
        throw new BadRequestException(`Submission sudah selesai dilakukan`)
      }

      const totalAnswered = await this.answerRepo.totalAnswered(submissionId)

      const totalQuestion = await this.questionRepo.totalAnswered(submission?.assessment_id)

      if (totalAnswered < totalQuestion) {
        const sisa = totalQuestion - totalAnswered;
        throw new BadRequestException(`Belum selesai! masih ada '${sisa}' soal lagi yang belum terjawab `)
      }

      const submissionWithAnswer = await this.submissionRepo.findOneSubmissionWithAnswer(submissionId)

      let totalScore = 0

      if (!submissionWithAnswer) {
        throw new NotFoundException('Data submission tidak ditemukan saat mau menghitung nilai.');
      }

      for (const a of submissionWithAnswer?.answer) {
        const score = a.option?.score ?? 0
        
        totalScore += score
      }

      return await this.submissionRepo.updateStatusFinishSubmission(submissionId, totalScore)
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
