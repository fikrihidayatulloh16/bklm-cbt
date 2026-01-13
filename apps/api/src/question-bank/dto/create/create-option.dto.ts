import { IsString, IsInt, IsNotEmpty } from 'class-validator';

export class createOptionDTO {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsNotEmpty()
  @IsInt()
  score: number;

  @IsInt()
  @IsNotEmpty()
  order: number;
}
