import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IncrementViewDto } from './dto/increment-view.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async increment(dto: IncrementViewDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const contentItem = await this.prisma.contentItem.findUnique({
      where: { id: dto.contentId },
      select: { authorId: true, viewsTotal: true },
    });

    if (!contentItem) {
      return { counted: false, views: 0 };
    }

    try {
      await this.prisma.contentViewEvent.create({
        data: {
          contentType: dto.contentType,
          contentId: dto.contentId,
          slug: dto.slug ?? '',
          authorId: contentItem.authorId,
          viewerId: dto.viewerId,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return { counted: false, views: contentItem.viewsTotal };
      }
      throw error;
    }

    await this.prisma.$transaction([
      this.prisma.contentItem.update({
        where: { id: dto.contentId },
        data: { viewsTotal: { increment: 1 } },
      }),
      this.prisma.contentViewTotal.upsert({
        where: {
          contentType_contentId: {
            contentType: dto.contentType,
            contentId: dto.contentId,
          },
        },
        create: {
          contentType: dto.contentType,
          contentId: dto.contentId,
          viewsTotal: 1,
          uniqueViewers: 1,
          lastViewedAt: new Date(),
        },
        update: {
          viewsTotal: { increment: 1 },
          uniqueViewers: { increment: 1 },
          lastViewedAt: new Date(),
        },
      }),
      this.prisma.contentViewDaily.upsert({
        where: {
          date_contentType_contentId: {
            date: today,
            contentType: dto.contentType,
            contentId: dto.contentId,
          },
        },
        create: {
          date: today,
          contentType: dto.contentType,
          contentId: dto.contentId,
          authorId: contentItem.authorId,
          views: 1,
          uniqueViewers: 1,
        },
        update: {
          views: { increment: 1 },
          uniqueViewers: { increment: 1 },
        },
      }),
      ...(contentItem.authorId
        ? [
            this.prisma.authorViewDaily.upsert({
              where: {
                date_authorId: {
                  date: today,
                  authorId: contentItem.authorId,
                },
              },
              create: {
                date: today,
                authorId: contentItem.authorId,
                [this.viewsField(dto.contentType)]: 1,
                totalViews: 1,
              },
              update: {
                [this.viewsField(dto.contentType)]: { increment: 1 },
                totalViews: { increment: 1 },
              },
            }),
          ]
        : []),
    ]);

    const updated = await this.prisma.contentItem.findUnique({
      where: { id: dto.contentId },
      select: { viewsTotal: true },
    });

    return { counted: true, views: updated?.viewsTotal ?? contentItem.viewsTotal + 1 };
  }

  async summary(contentType: string, contentId: string) {
    const [item, total] = await Promise.all([
      this.prisma.contentItem.findUnique({
        where: { id: contentId },
        select: { viewsTotal: true },
      }),
      this.prisma.contentViewTotal.findUnique({
        where: {
          contentType_contentId: {
            contentType: contentType as any,
            contentId,
          },
        },
      }),
    ]);

    return {
      contentType,
      contentId,
      views: item?.viewsTotal ?? 0,
      uniqueViewers: total?.uniqueViewers ?? 0,
    };
  }

  private viewsField(type: string) {
    switch (type) {
      case 'article':
        return 'articleViews';
      case 'news':
        return 'newsViews';
      case 'video':
        return 'videoViews';
      case 'gallery':
        return 'galleryViews';
      default:
        return 'totalViews';
    }
  }
}
