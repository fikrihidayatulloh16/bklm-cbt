// create-question.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '@prisma/client';
import { createOptionDTO } from './create-option.dto';

export class CreateBankQuestionDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsArray()
  @ValidateNested({ each: true }) // Validasi array
  @Type(() => createOptionDTO) // Panggil Class dari File 1
  options: createOptionDTO[];
}
