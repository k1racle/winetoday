import { Module } from '@nestjs/common';
import { WinemakersController } from './winemakers.controller';
import { WinemakersService } from './winemakers.service';
import { AdminWinemakersController } from './admin-winemakers.controller';

@Module({
  controllers: [WinemakersController, AdminWinemakersController],
  providers: [WinemakersService],
  exports: [WinemakersService],
})
export class WinemakersModule {}
