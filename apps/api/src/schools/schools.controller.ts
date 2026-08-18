import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { User } from 'src/common/decorators/user.decorator';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('SuperAdmin Page - Schools')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Post('create-school')
  @Roles('SUPERADMIN')
  async createSchool(@Body() createSchoolDto: CreateSchoolDto, @User('id') userId: string) {
    return await this.schoolsService.createSchool(createSchoolDto, userId);
  }

  @Get('list')
  @Roles('SUPERADMIN')
  async findAllSchool(@User('id') userId: string) {
    return await this.schoolsService.findAllSchool(userId);
  }

  @Get('detail/:schoolId')
  @Roles('SUPERADMIN')
  async findSchoolDetail(@Param('schoolId') schoolId: string) {
    return await this.schoolsService.findSchoolDetailBySchoolId(schoolId);
  }
}
