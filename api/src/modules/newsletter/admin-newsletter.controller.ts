import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { NewsletterService } from './newsletter.service';

@Controller('admin/newsletter')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminNewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Get('subscribers')
  @Roles(Role.admin, Role.editor)
  subscribers() {
    return this.newsletterService.activeSubscribers();
  }
}
