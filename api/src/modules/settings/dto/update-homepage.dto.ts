import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class UpdateHomepageDto {
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  leadItemIds?: string[];

  @IsOptional()
  @IsUUID()
  featuredVideoId?: string | null;

  @IsOptional()
  @IsUUID()
  leadArchiveCoverMediaId?: string | null;
}
