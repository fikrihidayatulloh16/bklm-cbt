import { Controller, Get, Param } from '@nestjs/common';
import { AssessmentService } from './assessment.service';

@Controller('exam') // Route: /exam
export class ExamController {
  constructor(private readonly assessmentsService: AssessmentService) {}

  @Get(':id') // GET /exam/uuid-ujian
  async getExamQuestions(@Param('id') id: string) {
    return this.assessmentsService.findOneAssessmentForExam(id);
  }
  
  // Nanti kita tambah endpoint submit di sini juga
  // @Post(':id/submit') ...
}