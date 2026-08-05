import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class PersonRelationInputDto {
  @IsUUID()
  relatedId: string;

  @IsString()
  type: string;
}

class PersonCareerItemDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  place?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class SavePersonDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(255)
  slug: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  birthYear?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  deathYear?: number;

  @IsOptional()
  @IsUUID()
  photoId?: string;

  @IsOptional()
  @IsUUID()
  wineryId?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  bioBlocks?: any[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonCareerItemDto)
  career?: PersonCareerItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonRelationInputDto)
  relations?: PersonRelationInputDto[];

  @IsOptional()
  @IsObject()
  seo?: Record<string, any>;

  @IsOptional()
  @IsString()
  status?: string;
}
