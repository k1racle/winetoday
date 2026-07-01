import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { IncrementViewDto } from './dto/increment-view.dto';

@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('views/increment')
  increment(@Body() dto: IncrementViewDto) {
    return this.analyticsService.increment(dto);
  }

  @Get('views/summary')
  summary(
    @Query('contentType') contentType: string,
    @Query('contentId') contentId: string,
  ) {
    return this.analyticsService.summary(contentType, contentId);
  }
}
