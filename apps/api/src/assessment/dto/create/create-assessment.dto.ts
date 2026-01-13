// src/assessment/dto/create-assessment.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsDate } from 'class-validator';

// Level 1: Assessment (Induk)
export class CreateAssessmentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string; // Tambahan opsional

  @IsOptional()
  @IsDate()
  expired_at: Date

  // Simulasi hardcode User ID & School ID dulu
  // (Nanti ini diambil otomatis dari Token Login/JWT)
  @IsString()
  @IsNotEmpty()
  user_id: '1';

  @IsString()
  @IsNotEmpty()
  school_id: '1';
}
