import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, Req, Put, Res, Query } from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { CreateAssessmentDto } from './dto/create/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { CreateAssessmentFromBankDto } from './dto/create/create-assessment-from-bank.dto';
import { User } from 'src/common/decorators/user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AssessmentExportService } from './assessment.export.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Assessment (Guru)')
// @UseGuards(AuthGuard('jwt'))
@Controller('assessments')
export class AssessmentController {
  constructor(
    private readonly assessmentService: AssessmentService,
    private readonly exportService: AssessmentExportService
  ) {}

  @Post('from-bank') // URL: POST /assessment/from-bank
  @HttpCode(HttpStatus.CREATED)
  async createFromBank (
    @Body() createAssessmentFromBankDto: CreateAssessmentFromBankDto, 
    @User('id') user_id: string
  ) {
    return await this.assessmentService.createFromBank(createAssessmentFromBankDto, user_id)
  }

  @Get('stats')
  @ApiOperation({ summary: 'Mengambil jumlah untuk kebutuhan stats dashboard' })
  getAssessmentStats(@User('id') userId: string,) {
    return this.assessmentService.getDashboardStats(userId)
  }

  @Get(':id/results') // URL: /assessment/123-abc/results
  findResults(
    @Param('id') id: string,
    @Query('class_name') className?: string
  ) {
    
    return this.assessmentService.findAssessmentResults(id, className);
  }

  @Get()
  findAll(
    @User('id') userID: string,) {
    return this.assessmentService.findAllAssessmentByIdUser(userID);
  }

  @Get(':id/submissions/:submissionId/answers')
  async findStudentAnswerDetails (
    @Param('id') AssessmentId: string,
    @Param('submissionId') submissionId: string,
  ) {
    return await this.assessmentService.findStudentAnswerDetails(AssessmentId, submissionId)
  }

  @Get(':id') // Endpoint: GET /assessments/uuid-disini
  async findOne(@Param('id') id: string) {
    return this.assessmentService.findOneAssessmentWithDetail(id);
  }

  @Get(':id/analytics')
  async getAnalytics(
    @Param('id') assessment_id: string,
    @Query('class_name') className?: string
  ) {
    return this.assessmentService.getAnalytics(assessment_id, className)
  }

  @Patch(':id/publish')
  async publishAssessment(@Param('id') assessmentId: string) {
    return await this.assessmentService.publishAssessment(assessmentId)
  }
  
  @Get(':id/export-excel')
  async exportExcel(
      @Param('id') id: string, 
      @Res() res: Response,
      @Query('class_name') className?: string
  ) {
      const buffer = await this.exportService.generateExcel(id, className);

      // 1. Set Header agar browser tahu ini file Excel
      res.set({
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="Laporan_Analisis_${id}.xlsx"`,
          'Content-Length': buffer.length,
      });

      // 2. Kirim Buffer langsung
      res.end(buffer);
  }

  @Get(':id/distinct-class')
  async getDistincStudentClass(@Param('id') assessmentId: string) {
    return await this.assessmentService.getDistinctStudentClass(assessmentId);
  }

  @Patch(':id/sync-status')
  // @UseGuards(TeacherGuard) // Pastikan hanya guru yang bisa akses
  async syncAssessmentStatus(@Param('id') AssessmentId: string) {
    console.log(`memasuki endpoint sinkron dengan id: ${AssessmentId}`);
    
    return this.assessmentService.forceCloseTimeouts(AssessmentId);
  }
}
