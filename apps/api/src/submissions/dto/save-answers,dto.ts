// apps/api/src/submissions/dto/save-answers.dto.ts
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

// DTO untuk Controller (HTTP Input) tetap dipertahankan karena NestJS butuh class
export class SaveAnswerDTO {
  @IsNotEmpty()
  @IsString()
  question_id!: string; // Tanda seru wajib untuk class NestJS

  @IsOptional()
  @IsString()
  option_id?: string;

  @IsOptional()
  @IsNumber()
  numeric_value?: number;

  @IsOptional()
  @IsString()
  text_value?: string;

  @IsNotEmpty()
  @IsBoolean()
  status_answer!: boolean;
}

/**
 * Type murni untuk komunikasi internal (Worker -> Repository).
 * Menghilangkan overhead class dan mengatasi error "has no initializer".
 */
export type SyncAnswerDto = {
  submission_id: string;
  question_id: string;
  text_value?: string;
  numeric_value?: number;
  option_id?: string;
};