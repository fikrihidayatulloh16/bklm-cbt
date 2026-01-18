import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateAssessmentFromBankDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNotEmpty()
    @IsNumber()
    duration: number

    @IsString()
    @IsNotEmpty()
    @IsUUID()
    question_bank_id: string;

    @IsString()
    @IsUUID()
    @IsOptional()
    school_id: string;
}