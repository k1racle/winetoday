import { IsEnum, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ContentType, ContentStatus } from '@prisma/client';

export const CONTENT_SORTS = ['new', 'old', 'popular', 'author'] as const;
export type ContentSort = (typeof CONTENT_SORTS)[number];

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
  @Max(100)
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
  @IsIn(CONTENT_SORTS as unknown as string[])
  sort?: ContentSort;

  @IsOptional()
  @Type(() => Boolean)
  featured?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  homepageLead?: boolean;
}
