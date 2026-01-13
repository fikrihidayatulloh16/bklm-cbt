import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
// import { CreateSubmissionDto } from './dto/create-submission.dto';
import { SaveAnswerDTO } from './dto/save-answers,dto';
import { StartSubmissionDTO } from './dto/start-submission.dto';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  async startSubmission(@Body() startSubmission: StartSubmissionDTO) {
    const result = await this.submissionsService.startSubmission(startSubmission)
     return {
      statuscode: HttpStatus.CREATED,
      message: 'Submission successfully initiated',
      data: result
     }
  }

  @Put(':id/answer')
  @HttpCode(HttpStatus.CREATED)
  async saveAnswer(
    @Param('id') id: string,
    @Body() saveAnswer: SaveAnswerDTO) {
    const result = await this.submissionsService.saveAnswer(id, saveAnswer)
     return {
      statuscode: HttpStatus.CREATED,
      message: 'Answer updated Successfully',
      data: result
     }
  }

  @Put(':id/finish')
  @HttpCode(HttpStatus.CREATED)
  async finish(
    @Param('id') id: string,
    @Body() saveAnswer: SaveAnswerDTO) {
    const result = await this.submissionsService.saveAnswer(id, saveAnswer)
     return {
      statuscode: HttpStatus.CREATED,
      message: 'Answer updated Successfully',
      data: result
     }
  }

  // @Get()
  // findAll() {
  //   return this.submissionsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.submissionsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateSubmissionDto: UpdateSubmissionDto) {
  //   return this.submissionsService.update(+id, updateSubmissionDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.submissionsService.remove(+id);
  // }
}
