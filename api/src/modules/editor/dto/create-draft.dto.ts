import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ContentType, ContentStatus } from '@prisma/client';

export class CreateDraftDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsEnum(ContentType)
  type: ContentType;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus = ContentStatus.draft;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsString()
  materialLabel?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsUUID()
  coverMediaId?: string;

  @IsOptional()
  @IsString()
  coverSource?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  duration?: number;

  @IsOptional()
  @IsUUID()
  authorId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  categoryIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  tagIds?: string[];

  @IsOptional()
  contentBlocks?: any;

  @IsOptional()
  sources?: any;

  @IsOptional()
  seo?: any;
}
