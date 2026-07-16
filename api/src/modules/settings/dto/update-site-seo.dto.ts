import { IsOptional, IsObject, IsUUID, IsBoolean } from 'class-validator';

export class DefaultSeoDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;
}

export class UpdateSiteSeoDto {
  @IsOptional()
  @IsObject()
  defaultSeo?: DefaultSeoDto;

  @IsOptional()
  @IsUUID()
  openGraphImageMediaId?: string;

  @IsOptional()
  @IsUUID()
  twitterImageMediaId?: string;

  @IsOptional()
  @IsBoolean()
  robotsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  sitemapEnabled?: boolean;

  @IsOptional()
  @IsObject()
  archiveSeo?: Record<string, { title?: string; description?: string; keywords?: string }>;

  @IsOptional()
  @IsObject()
  pageSeo?: Record<string, { title?: string; description?: string; keywords?: string }>;
}
