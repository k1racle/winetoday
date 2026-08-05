import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class WinePersonInputDto {
  @IsUUID()
  personId: string;

  @IsOptional()
  @IsString()
  role?: string;
}

export class SaveWineDto {
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
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  style?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  vintage?: number;

  @IsOptional()
  @IsArray()
  grapes?: string[];

  @IsOptional()
  @IsUUID()
  wineryId?: string;

  @IsOptional()
  @IsUUID()
  regionId?: string;

  @IsOptional()
  @IsUUID()
  terroirId?: string;

  @IsOptional()
  @IsArray()
  description?: any[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WinePersonInputDto)
  winemakers?: WinePersonInputDto[];

  @IsOptional()
  @IsObject()
  seo?: Record<string, any>;

  @IsOptional()
  @IsString()
  status?: string;
}
