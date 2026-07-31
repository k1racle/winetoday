import { ArrayNotEmpty, IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

export class SubscribeDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  topics?: string[];
}
