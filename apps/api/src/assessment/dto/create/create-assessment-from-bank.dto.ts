import { IsDate, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateAssessmentFromBankDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsOptional()
    @IsDate()
    expired_at: Date

    @IsString()
    @IsNotEmpty()
    @IsUUID()
    question_bank_id: string;

    @IsString()
    @IsUUID()
    @IsNotEmpty()
    user_id: string;

    @IsString()
    @IsUUID()
    @IsNotEmpty()
    school_id: string;
}