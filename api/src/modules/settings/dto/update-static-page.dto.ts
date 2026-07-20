import { IsOptional, IsString } from 'class-validator';

export class UpdateStaticPageDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  contentBlocks?: any;

  @IsOptional()
  seo?: any;
}
