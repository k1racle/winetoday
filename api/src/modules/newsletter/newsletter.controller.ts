import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { SubscribeDto } from './dto/subscribe.dto';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  subscribe(@Body() dto: SubscribeDto) {
    return this.newsletterService.subscribe(dto);
  }

  @Get('unsubscribe')
  unsubscribe(@Query('token') token: string) {
    return this.newsletterService.unsubscribe(token);
  }
}
