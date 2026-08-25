import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class ClaimTelegramLinkDto {
  @IsString()
  @Matches(/^[A-Z0-9]{8}$/)
  code: string;

  @IsString()
  @Matches(/^\d{1,20}$/)
  telegramUserId: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  telegramUsername?: string;
}
