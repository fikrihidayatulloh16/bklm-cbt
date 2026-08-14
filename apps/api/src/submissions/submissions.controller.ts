import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Put, ForbiddenException } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
// import { CreateSubmissionDto } from './dto/create-submission.dto';
import { SaveAnswerDTO } from './dto/save-answers,dto';
import { StartSubmissionDTO } from './dto/start-submission.dto';
import { Assessment } from 'src/common/decorators/assessment.decorator'

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post(':assessmentId/session/:sessionId/start')
  @HttpCode(HttpStatus.CREATED)
  async startSubmission(
    @Body() startSubmission: StartSubmissionDTO,
    @Param('assessmentId') assessment_id: string,
    @Param('sessionId') session_id: string,
  ) {
    console.log('memasuki endpoint submission start di submission \n', startSubmission, assessment_id, session_id);

    try {
      console.log('memasuki endpoint submission start di submission');
      const result = await this.submissionsService.startSubmission(startSubmission, assessment_id, session_id);
      
      return {
        statuscode: HttpStatus.CREATED,
        message: 'Submission successfully initiated',
        data: result
      };
    } catch (error: any) {
      // 🔥 TERJEMAHKAN ERROR DOMAIN KE HTTP 403 / 400
      console.error("🚨 CRASH DI CONTROLLER:", error);
      if (error.name === 'SubmissionDomainError') {
        // Karena ini urusan "hak akses" & "waktu habis", 403 Forbidden sangat tepat
        throw new ForbiddenException(error.message); 
      }
      
      // Jika itu BadRequestException bawaan (dari validasi DTO) atau lainnya, biarkan lewat
      throw error;
    }
    
    // const result = await this.submissionsService.startSubmission(startSubmission, assessment_id, session_id)
    //  return {
    //   statuscode: HttpStatus.CREATED,
    //   message: 'Submission successfully initiated',
    //   data: result
    //  }

     
  }

  @Get(':id')
  async getUniqueSubmissionWithQuestions(@Param('id') subMissionId: string) {
    return await this.submissionsService.getUniqueSubmissionWithQuestions(subMissionId);
  }

  @Get(':assessment_id/session/:session_id/timeleft')
  async getTimer(
    @Param('assessment_id') assessmentId: string,
    @Param('session_id') sessionId: string
  ) {
    const data = await this.submissionsService.getTimer(assessmentId, sessionId);
    return {
      statuscode: 200,
      message: 'Timer berhasil diambil',
      data,
    };
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

  @Put(':id/session/:session_id/finish')
  @HttpCode(HttpStatus.OK) // Ubah jadi OK (200)
  async finish(
    @Param('id') id: string,
    @Param('session_id') sessionId: string
  ) {
    // PANGGIL SERVICE FINISH, BUKAN SAVE ANSWER
    const result = await this.submissionsService.finish(id, sessionId);
    
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
