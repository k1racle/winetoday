import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class UpdateHomepageDto {
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  leadItemIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  videoItemIds?: string[];
}
