import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export const VIEW_TARGET_TYPES = ['article', 'news', 'video', 'gallery', 'person', 'wine'] as const;
export type ViewTargetType = (typeof VIEW_TARGET_TYPES)[number];

export class IncrementViewDto {
  @IsIn(VIEW_TARGET_TYPES)
  contentType: ViewTargetType;

  @IsUUID()
  contentId: string;

  @IsString()
  viewerId: string;

  @IsOptional()
  @IsString()
  slug?: string;
}
