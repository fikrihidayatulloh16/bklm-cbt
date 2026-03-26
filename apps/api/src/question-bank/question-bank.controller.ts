import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { QuestionBankService } from './question-bank.service';
import { CreateQuestionBankDto } from './dto/create/create-question-bank.dto';
import { UpdateQuestionBankDto } from './dto/update/update-question-bank.dto';
import { User } from 'src/common/decorators/user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { QuestionBankMapper } from './mapper/question-bank.mapper';

@ApiTags('Bank Soal (Guru)')
// @UseGuards(AuthGuard('jwt'))
@Controller('question-bank')
export class QuestionBankController {
  private readonly logger = new Logger(QuestionBankController.name);
  constructor(private readonly questionBankService: QuestionBankService) {}

  @Post()
  @ApiOperation({ summary: 'Buat Soal Baru' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateQuestionBankDto,
    @User('id') user_id: string
) {
    const result = await this.questionBankService.createQuestionBank(dto, user_id)
    return {
      statuscode: HttpStatus.CREATED,
      message: 'QuestionBank Successfully Created',
      data: result
    };
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua daftar bank soal' })
  findAll(@User('id') user_id: string) {
    this.logger.log('User sedang melihat daftar soal', {
        user: 'Guru Budi', // Nanti ini diganti user dari JWT
        action: 'VIEW_QUESTION_BANK_LIST'
    });
    return this.questionBankService.findAllByAuthor(user_id);
  }

 @Get(':id') // Endpoint: /question-banks/123-abc
 @ApiOperation({ summary: 'Ambil detil satu bank soal' })
    findOne(@Param('id') id: string) 
  {
    return this.questionBankService.findOne(id);
  }

  // Endpoint untuk delete question bank
  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus satu question Bank (Soft Delete)' })
  // Gunakan ParseUUIDPipe biar otomatis 400 Bad Request kalau ID ngawur
  async removeQuestionBank(@Param('id', ParseUUIDPipe) questionBankId: string) {
    return this.questionBankService.removeOneQuestionBank(questionBankId); // Hapus 'await' yang tidak perlu
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Mengubah satu question Bank (Surgycal)' })
  async updateQuestionBank(
    @Param('id', ParseUUIDPipe) questionBankId: string, 
    @Body() updateQuestionBankDto: UpdateQuestionBankDto
  ) {
    const params = QuestionBankMapper.toUpdateParams(updateQuestionBankDto);

    return this.questionBankService.updateQuestionBank(questionBankId, params);
  }

}
