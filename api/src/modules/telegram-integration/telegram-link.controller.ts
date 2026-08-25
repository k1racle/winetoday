import { Controller, Delete, Get, Post, Request, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TelegramIntegrationService } from './telegram-integration.service';

@Controller('integrations/telegram')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin, Role.editor, Role.author)
export class TelegramLinkController {
  constructor(private readonly telegram: TelegramIntegrationService) {}

  @Post('link-code')
  createLinkCode(@Request() req) {
    return this.telegram.createLinkCode(req.user.userId);
  }

  @Get('link-status')
  linkStatus(@Request() req) {
    return this.telegram.getLinkStatus(req.user.userId);
  }

  @Delete('link')
  unlink(@Request() req) {
    return this.telegram.unlink(req.user.userId);
  }
}
