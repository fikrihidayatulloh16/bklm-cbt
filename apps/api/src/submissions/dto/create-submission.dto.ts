import { IsDate, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateSubmissionDto {

    
    @IsOptional()
    @IsString()
    @IsUUID()
    student_id?: string;

    @IsNotEmpty()
    @IsInt()
    score: number;

    @IsNotEmpty()
    @IsDate()
    submitted_at: Date;

    
}
