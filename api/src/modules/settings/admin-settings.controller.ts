import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateSocialLinksDto } from './dto/update-social-links.dto';
import { UpdateSiteHeaderDto } from './dto/update-site-header.dto';
import { UpdateSiteSeoDto } from './dto/update-site-seo.dto';
import { UpdateStaticPageDto } from './dto/update-static-page.dto';
import { UpdateHomepageDto } from './dto/update-homepage.dto';

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

  @Get('admin/site-seo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  adminSiteSeo() {
    return this.settingsService.siteSeo();
  }

  @Patch('admin/site-seo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  updateSiteSeo(@Body() dto: UpdateSiteSeoDto) {
    return this.settingsService.updateSiteSeo(dto);
  }

  @Patch('admin/pages/:slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.editor)
  updateStaticPage(@Param('slug') slug: string, @Body() dto: UpdateStaticPageDto) {
    return this.settingsService.updateStaticPage(slug, dto);
  }

  @Get('admin/homepage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.editor)
  adminHomepage() {
    return this.settingsService.adminHomepage();
  }

  @Patch('admin/homepage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.editor)
  updateHomepage(@Body() dto: UpdateHomepageDto) {
    return this.settingsService.updateHomepage(dto);
  }
}
