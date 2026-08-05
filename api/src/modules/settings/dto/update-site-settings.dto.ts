import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSiteSettingsDto {
  @IsOptional()
  @IsBoolean()
  winemakersEnabled?: boolean;
}
