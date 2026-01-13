import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { CreateAssessmentDto } from './dto/create/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { CreateAssessmentFromBankDto } from './dto/create/create-assessment-from-bank.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('assessment')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAssessmentDto: CreateAssessmentDto, @Req() req) {
    console.log('User yang login:', req.user);
    const result = await this.assessmentService.create(createAssessmentDto);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Assessment Created Successfully',
      data: result,
    };
  }

  @Post('from-bank') // URL: POST /assessment/from-bank
  @HttpCode(HttpStatus.CREATED)
  async createFromBank (@Body() createAssessmentFromBankDto: CreateAssessmentFromBankDto) {
    return await this.assessmentService.createFromBank(createAssessmentFromBankDto)
  }

  @Get(':id/results') // URL: /assessment/123-abc/results
  findResults(@Param('id') id: string) {
    return this.assessmentService.findAssessmentResults(id);
  }

  @Get()
  findAll() {
    return this.assessmentService.findAll();
  }

  // @Get()
  // findAll() {
  //   return this.assessmentService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.assessmentService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAssessmentDto: UpdateAssessmentDto) {
  //   return this.assessmentService.update(+id, updateAssessmentDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.assessmentService.remove(+id);
  // }
}
