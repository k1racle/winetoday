import { Module } from '@nestjs/common';
import { WinemakersController } from './winemakers.controller';
import { WinemakersService } from './winemakers.service';
import { AdminWinemakersController } from './admin-winemakers.controller';
import { WinemakersEngagementController } from './winemakers-engagement.controller';
import { WinemakersEngagementService } from './winemakers-engagement.service';

@Module({
  controllers: [WinemakersController, AdminWinemakersController, WinemakersEngagementController],
  providers: [WinemakersService, WinemakersEngagementService],
  exports: [WinemakersService],
})
export class WinemakersModule {}
