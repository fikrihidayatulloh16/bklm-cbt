import { Gender } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator"

export class StartSubmissionDTO {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    assessment_id: string;

    @IsString()
    @IsNotEmpty()
    class_name: string;

    @IsNotEmpty()
    @IsString()
    student_name: string;

    @IsEnum(Gender)
    gender: Gender;
}