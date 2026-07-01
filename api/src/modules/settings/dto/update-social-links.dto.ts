import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SocialLinkDto {
  @IsString()
  label: string;

  @IsString()
  href: string;

  @IsOptional()
  @IsString()
  icon?: string;
}

export class UpdateSocialLinksDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  links: SocialLinkDto[];
}
