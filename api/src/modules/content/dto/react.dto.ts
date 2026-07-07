import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReactionType } from '@prisma/client';

export class ReactDto {
  @IsEnum(ReactionType)
  type: ReactionType;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  viewerId?: string;
}
