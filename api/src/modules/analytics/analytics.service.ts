import { Injectable } from '@nestjs/common';
import { CatalogEntityType, ContentType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IncrementViewDto, type ViewTargetType } from './dto/increment-view.dto';

const contentTypes = new Set<ViewTargetType>(['article', 'news', 'video', 'gallery']);

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async increment(dto: IncrementViewDto) {
    if (contentTypes.has(dto.contentType)) {
      return this.incrementContent(dto);
    }

    if (dto.contentType === 'person' || dto.contentType === 'wine') {
      return this.incrementCatalogEntity(dto.contentType, dto.contentId, dto.viewerId, dto.slug);
    }

    return { counted: false, views: 0 };
  }

  async summary(contentType: string, contentId: string) {
    if (contentTypes.has(contentType as ViewTargetType)) {
      const [item, total] = await Promise.all([
        this.prisma.contentItem.findUnique({
          where: { id: contentId },
          select: { viewsTotal: true },
        }),
        this.prisma.contentViewTotal.findUnique({
          where: {
            contentType_contentId: {
              contentType: contentType as ContentType,
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

    if (contentType === 'person' || contentType === 'wine') {
      return this.catalogEntitySummary(contentType, contentId);
    }

    return {
      contentType,
      contentId,
      views: 0,
      uniqueViewers: 0,
    };
  }

  private async incrementContent(dto: IncrementViewDto) {
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
          contentType: dto.contentType as ContentType,
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
            contentType: dto.contentType as ContentType,
            contentId: dto.contentId,
          },
        },
        create: {
          contentType: dto.contentType as ContentType,
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
            contentType: dto.contentType as ContentType,
            contentId: dto.contentId,
          },
        },
        create: {
          date: today,
          contentType: dto.contentType as ContentType,
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

  private async incrementCatalogEntity(
    entityType: CatalogEntityType,
    entityId: string,
    viewerId: string,
    slug?: string,
  ) {
    const entity = await this.getCatalogEntity(entityType, entityId);
    if (!entity) {
      return { counted: false, views: 0 };
    }

    try {
      await this.prisma.catalogViewEvent.create({
        data: {
          entityType,
          entityId,
          viewerId,
          slug: slug ?? '',
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return { counted: false, views: entity.viewsTotal };
      }
      throw error;
    }

    const updated = await this.updateCatalogEntityViews(entityType, entityId);
    return {
      counted: true,
      views: updated?.viewsTotal ?? entity.viewsTotal + 1,
    };
  }

  private async catalogEntitySummary(entityType: CatalogEntityType, entityId: string) {
    const [entity, uniqueViewers] = await Promise.all([
      this.getCatalogEntity(entityType, entityId),
      this.prisma.catalogViewEvent.count({
        where: {
          entityType,
          entityId,
        },
      }),
    ]);

    return {
      contentType: entityType,
      contentId: entityId,
      views: entity?.viewsTotal ?? 0,
      uniqueViewers,
    };
  }

  private getCatalogEntity(entityType: CatalogEntityType, entityId: string) {
    if (entityType === CatalogEntityType.person) {
      return this.prisma.person.findUnique({
        where: { id: entityId },
        select: { viewsTotal: true },
      });
    }

    return this.prisma.wine.findUnique({
      where: { id: entityId },
      select: { viewsTotal: true },
    });
  }

  private updateCatalogEntityViews(entityType: CatalogEntityType, entityId: string) {
    if (entityType === CatalogEntityType.person) {
      return this.prisma.person.update({
        where: { id: entityId },
        data: { viewsTotal: { increment: 1 } },
        select: { viewsTotal: true },
      });
    }

    return this.prisma.wine.update({
      where: { id: entityId },
      data: { viewsTotal: { increment: 1 } },
      select: { viewsTotal: true },
    });
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
