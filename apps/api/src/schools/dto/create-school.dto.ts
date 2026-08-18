import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateSchoolDto {
    @IsString()
    @IsNotEmpty()
    name!: string;
}
