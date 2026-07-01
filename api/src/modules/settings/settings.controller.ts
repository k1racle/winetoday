import { Controller, Get } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('site-settings')
  siteSettings() {
    return this.settingsService.siteSettings();
  }

  @Get('homepage')
  homepage() {
    return this.settingsService.homepage();
  }

  @Get('site-header')
  siteHeader() {
    return this.settingsService.siteHeader();
  }

  @Get('site-footer')
  siteFooter() {
    return this.settingsService.siteFooter();
  }

  @Get('site-seo')
  siteSeo() {
    return this.settingsService.siteSeo();
  }

  @Get('settings/watermark')
  watermark() {
    return this.settingsService.watermark();
  }
}
