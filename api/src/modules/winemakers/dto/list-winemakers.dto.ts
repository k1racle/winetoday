import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListWinemakersDto {
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
  q?: string;

  @IsOptional()
  @Type(() => Boolean)
  featured?: boolean;

  @IsOptional()
  winerySlug?: string;

  @IsOptional()
  regionSlug?: string;

  @IsOptional()
  sort?: 'default' | 'latest';
}
