import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateQuestionBankDto } from './dto/create/create-question-bank.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBankQuestionDto } from './dto/create/create-bankquestion.dto';
import { QuestionBankMapper } from './mapper/question-bank.mapper';
// import { UpdateQuestionBankDto } from './dto/update-question-bank.dto';

@Injectable()
export class QuestionBankService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateQuestionBankDto) {
    this.ValidateQuestionLogic(dto.questions);

    return await this.prisma.questionBank.create({
      data: {
        title: dto.title,
        description: dto.description,
        questions: {
          create: QuestionBankMapper.toPrismaCreate(dto.questions),
        },
      },
    });
  }

  private ValidateQuestionLogic(questions: CreateBankQuestionDto[]) {
    for (const q of questions) {
      if (q.type == 'MULTIPLE_CHOICE') {
        const correctAnswers = q.options.filter((opt) => opt.score > 0).length;

        if ( correctAnswers === 0  ) {
          throw new BadRequestException(`Pertanyaan "${q.text}" minimal punya 1 jawaban yang benar`)
        } else if  (correctAnswers > 1 ) {
          throw new BadRequestException(`Pertanyaan "${q.text}" tidak boleh memiliki lebih dari 1 jawaban yang benar`)
        } 
        // else if (q.options.find((opt) => opt.score > 0)) {
        //   throw new BadRequestException(`Pertanyaan "${q.text}" jawaban yang benar hanya bernilai 1`)
        // }
      } if (q.type == 'SCALE') {
        if ( q.options.length < 2 ) { throw new BadRequestException(`Pertanyaan "${q.text}" minimal punya 2 jawaban skala`) }
      }
    }
  }

  async findAll() {
    return await this.prisma.questionBank.findMany()
  }

  /**
   * if (type == 'MULTIPLE_CHOICE') {
   *  
   * } else if (type == 'SCALE') {
   * 
   * }
   */

  // findAll() {
  //   return `This action returns all questionBank`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} questionBank`;
  // }

  // update(id: number, updateQuestionBankDto: UpdateQuestionBankDto) {
  //   return `This action updates a #${id} questionBank`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} questionBank`;
  // }
}
