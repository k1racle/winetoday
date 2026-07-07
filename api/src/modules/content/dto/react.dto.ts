import { IsEnum } from 'class-validator';
import { ReactionType } from '@prisma/client';

export class ReactDto {
  @IsEnum(ReactionType)
  type: ReactionType;
}
