import { IsArray, IsEnum, IsNotEmpty, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class YesNoItemDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  // Trim & Uppercase otomatis
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() : value)
  category: string;

  // Frontend cukup kirim "YA" atau "TIDAK". 
  // Backend nanti yang mengubah ini menjadi options: [{label: 'YA', score: 10}, ...]
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() : value)
  @IsEnum(['YA', 'TIDAK'])
  correct_answer: 'YA' | 'TIDAK';
}

export class CreateBulkYesNoDto {
  @IsUUID()
  @IsNotEmpty()
  assessment_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => YesNoItemDto)
  questions: YesNoItemDto[];
}