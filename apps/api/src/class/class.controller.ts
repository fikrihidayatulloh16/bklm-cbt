import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ClassService } from './class.service';
import { CreateClassDto } from './class.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Post()
  async createClass(@Body() createClassDto: CreateClassDto) {
    // Kontroler hanya mengirim DTO ke Service dan mengembalikan respons
    const result = await this.classService.createClass(createClassDto);
    return {
      status: 'success',
      data: result,
    };
  }

  @Get('school/:schoolId')
  async getClassesBySchool(@Param('schoolId') schoolId: string) {
    const results = await this.classService.getClassesBySchool(schoolId);
    return {
      status: 'success',
      data: results,
    };
  }
}