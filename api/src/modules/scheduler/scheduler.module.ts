import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { IndexNowModule } from '../index-now/index-now.module';

@Module({
  imports: [IndexNowModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
