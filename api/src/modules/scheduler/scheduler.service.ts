import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IndexNowService } from '../index-now/index-now.service';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly indexNowService: IndexNowService,
  ) {}

  onModuleInit() {
    this.publishScheduled();
    setInterval(() => this.publishScheduled(), 60_000);
  }

  private async publishScheduled() {
    try {
      const now = new Date();
      const publishedItems = await this.prisma.$transaction(async (transaction) => {
        const dueItems = await transaction.contentItem.findMany({
          where: {
            status: ContentStatus.scheduled,
            publishedAt: { lte: now },
          },
          select: { id: true, type: true, slug: true },
        });
        const claimedItems: typeof dueItems = [];

        for (const item of dueItems) {
          const result = await transaction.contentItem.updateMany({
            where: {
              id: item.id,
              status: ContentStatus.scheduled,
              publishedAt: { lte: now },
            },
            data: { status: ContentStatus.published },
          });
          if (result.count === 1) claimedItems.push(item);
        }

        return claimedItems;
      });

      if (publishedItems.length > 0) {
        this.logger.log(`Published ${publishedItems.length} scheduled item(s)`);
        void this.indexNowService.notifyContent(publishedItems);
      }
    } catch (err) {
      this.logger.error('Failed to publish scheduled items', err);
    }
  }
}
