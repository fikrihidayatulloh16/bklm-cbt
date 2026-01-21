import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
// import { CreateSubmissionDto } from './dto/create-submission.dto';
import { SaveAnswerDTO } from './dto/save-answers,dto';
import { StartSubmissionDTO } from './dto/start-submission.dto';
import { Assessment } from 'src/common/decorators/assessment.decorator'

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post(':assessment_id/start')
  @HttpCode(HttpStatus.CREATED)
  async startSubmission(
    @Body() startSubmission: StartSubmissionDTO,
    @Param('assessment_id') assessment_id: string,
  ) {
    const result = await this.submissionsService.startSubmission(startSubmission, assessment_id)
     return {
      statuscode: HttpStatus.CREATED,
      message: 'Submission successfully initiated',
      data: result
     }
  }

  @Get(':id')
  async getUniqueSubmissionWithQuestions(@Param('id') subMissionId: string) {
    return await this.submissionsService.getUniqueSubmissionWithQuestions(subMissionId);
  }

  @Get(':assessment_id/timeleft')
  async getTimeLeft(@Param('id') assessment_id: string) {
    return await this.submissionsService.getTimer(assessment_id)
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
  @HttpCode(HttpStatus.OK) // Ubah jadi OK (200)
  async finish(
    @Param('id') id: string
    // @Body() saveAnswer: SaveAnswerDTO <-- HAPUS INI, finish tidak butuh body
  ) {
    // PANGGIL SERVICE FINISH, BUKAN SAVE ANSWER
    const result = await this.submissionsService.finish(id);
    
     return {
      statuscode: HttpStatus.OK,
      message: 'Exam finished successfully',
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
