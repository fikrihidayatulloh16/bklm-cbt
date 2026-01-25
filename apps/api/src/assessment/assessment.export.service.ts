import { Injectable } from '@nestjs/common';
import { AssessmentService } from './assessment.service'; // Pastikan path import benar
import { AssessmentHelper } from './helper/excel-assessment-report';

@Injectable()
export class AssessmentExportService {
  
  constructor(private assessmentService: AssessmentService) {}

  async generateExcel(assessmentId: string, className?: string) {
      // 1. AMBIL DATA DARI DATABASE
      const data = await this.assessmentService.getAnalytics(assessmentId, className);
  
      // 2. GENERATE EXCEL VIA HELPER (Cukup 1 baris ini saja)
      // Tidak perlu 'new ExcelJS.Workbook()' disini karena sudah dilakukan di dalam Helper
      const buffer = await AssessmentHelper.generateAnalysisExcel(data);
  
      // 3. RETURN BUFFER
      return buffer;
  }
}