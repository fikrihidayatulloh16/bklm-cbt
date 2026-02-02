import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionBankDto } from '../create/create-question-bank.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsArray, IsBoolean, ValidateNested, IsOptional } from 'class-validator';
import { UpdateBankQuestionDto } from './update-bank-question.dto';
import { Type } from 'class-transformer';

export class UpdateQuestionBankDto extends PartialType(
  OmitType(CreateQuestionBankDto, ['questions'] as const), 
) {
    // 3. Sekarang kita bebas mendefinisikan 'questions' versi kita sendiri
    //    tanpa diprotes TypeScript karena beda struktur (gak ada category)
    @ApiProperty({ 
        type: [UpdateBankQuestionDto],
        description: 'List soal update'
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateBankQuestionDto)
    questions?: UpdateBankQuestionDto[];
}