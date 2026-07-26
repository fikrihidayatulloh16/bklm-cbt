// apps/api/src/assessment/dto/publish-assessment.dto.ts
import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class PublishAssessmentDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'Minimal harus memilih satu kelas untuk memublikasikan ujian.' })
  @IsString({ each: true, message: 'ID Kelas harus berupa teks.' })
  classIds!: string[];
}