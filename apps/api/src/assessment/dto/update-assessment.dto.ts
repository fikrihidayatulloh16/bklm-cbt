import { PartialType } from '@nestjs/mapped-types';
import { CreateAssessmentDto } from './create/create-assessment.dto';

export class UpdateAssessmentDto extends PartialType(CreateAssessmentDto) {}
