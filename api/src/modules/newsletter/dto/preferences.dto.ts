import { IsArray, IsBoolean, IsString } from 'class-validator';

export class UpdatePreferencesDto {
  @IsString()
  token: string;

  @IsArray()
  @IsString({ each: true })
  topics: string[];

  @IsBoolean()
  isActive: boolean;
}
