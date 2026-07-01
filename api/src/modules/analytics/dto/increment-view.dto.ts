import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ContentType } from '@prisma/client';

export class IncrementViewDto {
  @IsEnum(ContentType)
  contentType: ContentType;

  @IsUUID()
  contentId: string;

  @IsString()
  viewerId: string;

  @IsOptional()
  @IsString()
  slug?: string;
}
