import { Controller, Post, Body, Get, Param, BadRequestException } from '@nestjs/common';
import { AssessmentSessionService } from './assessment-session.service';
import { CreateAssessmentSessionDto } from './dto/create-assessment-session.dto';

@Controller('assessment-sessions')
export class AssessmentSessionController {
  constructor(private readonly sessionService: AssessmentSessionService) {}

  @Post()
  async createSession(@Body() dto: CreateAssessmentSessionDto) {
    try {
      // Panggil service
      const data = await this.sessionService.createScheduledSession(dto);
      
      return {
        status: 'success',
        message: 'Sesi ujian terjadwal berhasil dibuat dan didistribusikan ke kelas.',
        data: {
          id: data._id,
          name: data._name,
          classIds: data._classIds
        },
      };
    } catch (error: any) {
      // 🔥 PENERJEMAH ERROR DOMAIN KE HTTP 400
      if (error.message && error.message.includes('DomainError')) {
        // Hilangkan kata "DomainError: " agar pesan ke frontend lebih rapi
        throw new BadRequestException(error.message.replace('DomainError: ', ''));
      }
      
      // Jika error database atau lainnya, biarkan NestJS menangani (HTTP 500)
      throw error;
    }
  }

  @Get('class/:classId/active')
  async getActiveSessions(@Param('classId') classId: string) {
    // 🔥 Panggil fungsi yang benar secara logika
    const sessions = await this.sessionService.getActiveSessionsByClassId(classId);
    
    // Mapping: Ubah Entity menjadi Response DTO yang bersih
    // (Pastikan properti Domain Anda memakai _id atau id sesuai di entity Anda)
    const cleanData = sessions.map(session => ({
      id: session._id, 
      name: session._name,
      start_time: session._startTime,
      end_time: session._endTime,
      assessment_id: session._assessmentId
    }));

    return {
      status: 'success',
      message: 'Berhasil mengambil sesi ujian yang sedang aktif',
      data: cleanData
    };
  }
}