import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
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
  async create(@Body() dto: CreateQuestionBankDto, @Req() req) {
    const userId = req.user.id;
    const result = await this.questionBankService.create(dto, userId)
    return {
      statuscode: HttpStatus.CREATED,
      message: 'QuestionBank Successfully Created',
      data: result
    };
  }

  @Get()
  findAll(@Req() req) {
    return this.questionBankService.findAllByAuthor(req.user.id);
  }

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
