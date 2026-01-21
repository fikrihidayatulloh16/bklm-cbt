import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, Req, Put, Res } from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { CreateAssessmentDto } from './dto/create/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { CreateAssessmentFromBankDto } from './dto/create/create-assessment-from-bank.dto';
import { User } from 'src/common/decorators/user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

// @UseGuards(AuthGuard('jwt'))
@Controller('assessments')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post('from-bank') // URL: POST /assessment/from-bank
  @HttpCode(HttpStatus.CREATED)
  async createFromBank (
    @Body() createAssessmentFromBankDto: CreateAssessmentFromBankDto, 
    @User('id') user_id: string
  ) {
    return await this.assessmentService.createFromBank(createAssessmentFromBankDto, user_id)
  }

  @Get(':id/results') // URL: /assessment/123-abc/results
  findResults(@Param('id') id: string) {
    return this.assessmentService.findAssessmentResults(id);
  }

  @Get()
  findAll(
    @User('id') userID: string,
  ) {
    return this.assessmentService.findAllAssessmentByIdUser(userID);
  }

  @Get(':id') // Endpoint: GET /assessments/uuid-disini
  async findOne(@Param('id') id: string) {
    return this.assessmentService.findOneAssessmentWithDetail(id);
  }

  @Get(':id/analytics')
  async getAnalytics(@Param('id') assessment_id: string) {
    return this.assessmentService.getAnalytics(assessment_id)
  }

  @Patch(':id/publish')
  async publishAssessment(@Param('id') assessmentId: string) {
    return await this.assessmentService.publishAssessment(assessmentId)
  }
  
  @Get(':id/export-excel')
  async exportExcel(
      @Param('id') id: string, 
      @Res() res: Response
  ) {
      const buffer = await this.assessmentService.generateExcel(id);

      // 1. Set Header agar browser tahu ini file Excel
      res.set({
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="Laporan_Analisis_${id}.xlsx"`,
          'Content-Length': buffer.length,
      });

      // 2. Kirim Buffer langsung
      res.end(buffer);
  }
}
