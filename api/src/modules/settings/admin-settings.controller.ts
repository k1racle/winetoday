import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateSocialLinksDto } from './dto/update-social-links.dto';
import { UpdateSiteHeaderDto } from './dto/update-site-header.dto';

@Controller()
export class AdminSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('site-settings/social-links')
  socialLinks() {
    return this.settingsService.socialLinks();
  }

  @Patch('admin/site-settings/social-links')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  updateSocialLinks(@Body() dto: UpdateSocialLinksDto) {
    return this.settingsService.updateSocialLinks(dto);
  }


  @Get('admin/site-header')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  adminSiteHeader() {
    return this.settingsService.siteHeader();
  }

  @Patch('admin/site-header')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  updateSiteHeader(@Body() dto: UpdateSiteHeaderDto) {
    return this.settingsService.updateSiteHeader(dto);
  }
}
