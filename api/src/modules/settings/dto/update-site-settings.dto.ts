import { IsBoolean, IsObject, IsOptional } from 'class-validator';

export class UpdateSiteSettingsDto {
  @IsOptional()
  @IsBoolean()
  winemakersEnabled?: boolean;

  @IsOptional()
  @IsObject()
  winemakersHomeConfig?: Record<string, unknown>;
}
