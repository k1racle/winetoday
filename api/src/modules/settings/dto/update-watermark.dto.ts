import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class UpdateWatermarkDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsUUID()
  mediaId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  opacity?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  sizePercent?: number;

  @IsOptional()
  @IsString()
  position?:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'center';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  offsetTopPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  offsetRightPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  offsetBottomPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  offsetLeftPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minSizePx?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxSizePx?: number;
}
