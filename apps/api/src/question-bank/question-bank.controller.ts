import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { QuestionBankService } from './question-bank.service';
import { CreateQuestionBankDto } from './dto/create/create-question-bank.dto';
import { UpdateQuestionBankDto } from './dto/update-question-bank.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('question-bank')
export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createQuestionBankDto: CreateQuestionBankDto) {
    const result = await this.questionBankService.create(createQuestionBankDto)
    return {
      statuscode: HttpStatus.CREATED,
      message: 'QuestionBank Successfully Created',
      data: result
    };
  }

  // @Get()
  // findAll() {
  //   return this.questionBankService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.questionBankService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateQuestionBankDto: UpdateQuestionBankDto) {
  //   return this.questionBankService.update(+id, updateQuestionBankDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.questionBankService.remove(+id);
  // }
}
