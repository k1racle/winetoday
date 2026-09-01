import { Module } from '@nestjs/common';
import { IndexNowService } from './index-now.service';

@Module({
  providers: [IndexNowService],
  exports: [IndexNowService],
})
export class IndexNowModule {}
