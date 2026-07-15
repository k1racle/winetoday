import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ContentType, ContentStatus } from '@prisma/client';

export class ListContentDto {
  @IsOptional()
  @IsEnum(ContentType)
  type?: ContentType;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  limit = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset = 0;

  @IsOptional()
  categorySlug?: string;

  @IsOptional()
  tagSlug?: string;

  @IsOptional()
  authorSlug?: string;

  @IsOptional()
  search?: string;

  @IsOptional()
  @Type(() => Boolean)
  featured?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  homepageLead?: boolean;
}
