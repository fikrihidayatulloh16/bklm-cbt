import { IsArray, IsBoolean, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateBankQuestionDto } from './create-bankquestion.dto';

export class CreateQuestionBankDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsBoolean()
  @IsNotEmpty()
  shared: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBankQuestionDto)
  questions: CreateBankQuestionDto[];
}
