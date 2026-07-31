import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { UpdatePreferencesDto } from './dto/preferences.dto';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  subscribe(@Body() dto: SubscribeDto) {
    return this.newsletterService.subscribe(dto);
  }

  @Get('confirm')
  confirm(@Query('token') token: string) {
    return this.newsletterService.confirm(token);
  }

  @Get('preferences')
  getPreferences(@Query('token') token: string) {
    return this.newsletterService.getPreferences(token);
  }

  @Post('preferences')
  updatePreferences(@Body() dto: UpdatePreferencesDto) {
    return this.newsletterService.updatePreferences(dto);
  }

  @Get('unsubscribe')
  unsubscribe(@Query('token') token: string) {
    return this.newsletterService.unsubscribe(token);
  }
}
