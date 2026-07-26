// apps/api/src/assessment-session/dto/update-assessment-session.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateAssessmentSessionDto } from './create-assessment-session.dto';

export class UpdateAssessmentSessionDto extends PartialType(CreateAssessmentSessionDto) {}
