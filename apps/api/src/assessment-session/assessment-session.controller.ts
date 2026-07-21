import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AssessmentSessionService } from './assessment-session.service';
import { CreateAssessmentSessionDto } from './dto/create-assessment-session.dto';

@Controller('assessment-sessions')
export class AssessmentSessionController {
  constructor(private readonly sessionService: AssessmentSessionService) {}

  @Post()
  async createSession(@Body() dto: CreateAssessmentSessionDto) {
    const data = await this.sessionService.createSession(dto);
    
    return {
      status: 'success',
      message: 'Sesi ujian berhasil dibuat dan didistribusikan ke kelas.',
      data,
    };
  }

  @Get('class/:classId/active')
  async getActiveSessionsForClass(@Param('classId') classId: string) {
    const data = await this.sessionService.getActiveSessions(classId);
    
    return {
      status: 'success',
      message: 'Berhasil mengambil sesi ujian yang sedang aktif',
      data,
    };
  }
}