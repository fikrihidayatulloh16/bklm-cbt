import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { QuestionBankService } from './question-bank.service';
import { CreateQuestionBankDto } from './dto/create/create-question-bank.dto';
import { UpdateQuestionBankDto } from './dto/update-question-bank.dto';
import { User } from 'src/common/decorators/user.decorator';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('question-bank')
export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) {}

  @Post()
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
  findAll(@User('id') user_id: string) {
    return this.questionBankService.findAllByAuthor(user_id);
  }

 @Get(':id') // Endpoint: /question-banks/123-abc
    findOne(@Param('id') id: string) {
  return this.questionBankService.findOne(id);
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
