import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateSiteHeaderDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  lightLogoMediaId?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  darkLogoMediaId?: string;
}
