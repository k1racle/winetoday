import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.publishScheduled();
    setInterval(() => this.publishScheduled(), 60_000);
  }

  private async publishScheduled() {
    try {
      const result = await this.prisma.contentItem.updateMany({
        where: {
          status: ContentStatus.scheduled,
          publishedAt: { lte: new Date() },
        },
        data: { status: ContentStatus.published },
      });
      if (result.count > 0) {
        this.logger.log(`Published ${result.count} scheduled item(s)`);
      }
    } catch (err) {
      this.logger.error('Failed to publish scheduled items', err);
    }
  }
}
