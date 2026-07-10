import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, ContentType, Prisma, ReactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListContentDto } from './dto/list-content.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import {
  matchSidebarCategory,
  SIDEBAR_CATEGORY_GROUPS,
} from './sidebar-category-order';

const contentInclude = {
  author: { include: { avatarMedia: true } },
  coverMedia: true,
  archiveCoverMedia: true,
  categories: true,
  tags: true,
} satisfies Prisma.ContentItemInclude;

export type ContentItemWithRelations = Prisma.ContentItemGetPayload<{
  include: typeof contentInclude;
}>;

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(dto: ListContentDto) {
    const where: Prisma.ContentItemWhereInput = {
      type: dto.type,
    };

    if (dto.status) {
      where.status = dto.status;
    } else {
      where.status = ContentStatus.published;
      where.publishedAt = { lte: new Date() };
    }

    if (dto.featured !== undefined) {
      where.featured = dto.featured;
    }

    if (dto.homepageLead !== undefined) {
      where.homepageLead = dto.homepageLead;
    }

    if (dto.categorySlug) {
      const categoryIds = await this.getCategoryAndDescendantIds(dto.categorySlug);
      where.categories = categoryIds.length
        ? { some: { id: { in: categoryIds } } }
        : { some: { slug: dto.categorySlug } };
    }

    if (dto.tagSlug) {
      where.tags = { some: { slug: dto.tagSlug } };
    }

    if (dto.authorSlug) {
      where.author = { slug: dto.authorSlug };
    }

    const [items, total] = await Promise.all([
      this.prisma.contentItem.findMany({
        where,
        include: contentInclude,
        orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip: dto.offset,
        take: dto.limit,
      }),
      this.prisma.contentItem.count({ where }),
    ]);

    return { items, total, limit: dto.limit, offset: dto.offset };
  }

  async findBySlug(
    type: ContentType,
    slug: string,
    options?: { preview?: boolean },
  ): Promise<ContentItemWithRelations> {
    const where: Prisma.ContentItemWhereUniqueInput = {
      type_slug: { type, slug },
    };

    const item = await this.prisma.contentItem.findUnique({
      where,
      include: contentInclude,
    });

    if (!item) {
      throw new NotFoundException(`${type} not found`);
    }

    if (!options?.preview && item.status !== ContentStatus.published) {
      throw new NotFoundException(`${type} not found`);
    }

    return item;
  }

  async findCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, parentId: true },
    });
  }

  private async getCategoryAndDescendantIds(slug: string): Promise<string[]> {
    // Find the canonical category plus any duplicates with suffixes like -2, -3, etc.
    const candidates = await this.prisma.category.findMany({
      where: {
        OR: [
          { slug },
          { slug: { startsWith: `${slug}-` } },
        ],
      },
      select: { id: true, slug: true, parentId: true },
    });

    const duplicateSuffixPattern = new RegExp(`^${this.escapeRegex(slug)}-(\\d+)$`);
    const matchingIds = candidates
      .filter((c) => c.slug === slug || duplicateSuffixPattern.test(c.slug))
      .map((c) => c.id);

    if (matchingIds.length === 0) {
      return [];
    }

    const allCategories = await this.prisma.category.findMany({
      select: { id: true, parentId: true },
    });

    const categoryMap = new Map<string, string | null>();
    for (const c of allCategories) {
      categoryMap.set(c.id, c.parentId);
    }

    const descendantIds: string[] = [];
    const queue = [...matchingIds];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (descendantIds.includes(currentId)) {
        continue;
      }
      descendantIds.push(currentId);
      for (const [id, parentId] of categoryMap.entries()) {
        if (parentId === currentId) {
          queue.push(id);
        }
      }
    }

    return descendantIds;
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async findTags() {
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    });
  }

  async findLatestByCategory(limit = 5) {
    const categories = await this.prisma.category.findMany({
      select: { id: true, name: true, slug: true },
    });

    const result = [];

    for (const group of SIDEBAR_CATEGORY_GROUPS) {
      const category = matchSidebarCategory(categories, group);
      if (!category) {
        continue;
      }

      const categoryIds = await this.getCategoryAndDescendantIds(category.slug);
      const items = await this.prisma.contentItem.findMany({
        where: {
          status: ContentStatus.published,
          categories: categoryIds.length
            ? { some: { id: { in: categoryIds } } }
            : { some: { id: category.id } },
          publishedAt: { lte: new Date() },
        },
        include: contentInclude,
        orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
        take: limit,
      });

      if (!items.length) {
        continue;
      }

      result.push({
        category: {
          ...category,
          name: group.label,
        },
        items,
      });
    }

    return result;
  }

  async findHomepageContent() {
    const [lead, articles, news, videos, galleries] = await Promise.all([
      this.prisma.contentItem.findMany({
        where: { homepageLead: true, status: ContentStatus.published, publishedAt: { lte: new Date() } },
        include: contentInclude,
        orderBy: { publishedAt: 'desc' },
        take: 5,
      }),
      this.prisma.contentItem.findMany({
        where: { type: ContentType.article, status: ContentStatus.published, publishedAt: { lte: new Date() } },
        include: contentInclude,
        orderBy: { publishedAt: 'desc' },
        take: 20,
      }),
      this.prisma.contentItem.findMany({
        where: { type: ContentType.news, status: ContentStatus.published, publishedAt: { lte: new Date() } },
        include: contentInclude,
        orderBy: { publishedAt: 'desc' },
        take: 40,
      }),
      this.prisma.contentItem.findMany({
        where: { type: ContentType.video, status: ContentStatus.published, publishedAt: { lte: new Date() } },
        include: contentInclude,
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.contentItem.findMany({
        where: { type: ContentType.gallery, status: ContentStatus.published, publishedAt: { lte: new Date() } },
        include: contentInclude,
        orderBy: { publishedAt: 'desc' },
        take: 6,
      }),
    ]);

    return { lead, articles, news, videos, galleries };
  }

  // Category admin
  async createCategory(dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        parentId: dto.parentId || null,
      },
      select: { id: true, name: true, slug: true, parentId: true },
    });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    await this.findCategoryOrThrow(id);
    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.parentId !== undefined && { parentId: dto.parentId }),
      },
      select: { id: true, name: true, slug: true, parentId: true },
    });
  }

  async deleteCategory(id: string) {
    await this.findCategoryOrThrow(id);
    return this.prisma.category.delete({ where: { id } });
  }

  private async findCategoryOrThrow(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  // Tag admin
  async createTag(dto: CreateTagDto) {
    return this.prisma.tag.create({
      data: { name: dto.name, slug: dto.slug },
      select: { id: true, name: true, slug: true },
    });
  }

  async updateTag(id: string, dto: UpdateTagDto) {
    await this.findTagOrThrow(id);
    return this.prisma.tag.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
      },
      select: { id: true, name: true, slug: true },
    });
  }

  async deleteTag(id: string) {
    await this.findTagOrThrow(id);
    return this.prisma.tag.delete({ where: { id } });
  }

  private async findTagOrThrow(id: string) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    return tag;
  }

  async getReactions(contentItemId: string, userId?: string, viewerId?: string) {
    const [likes, dislikes, userReaction] = await Promise.all([
      this.prisma.reaction.count({ where: { contentItemId, type: ReactionType.like } }),
      this.prisma.reaction.count({ where: { contentItemId, type: ReactionType.dislike } }),
      userId
        ? this.prisma.reaction.findUnique({
            where: { contentItemId_userId: { contentItemId, userId } },
            select: { type: true },
          })
        : viewerId
          ? this.prisma.reaction.findUnique({
              where: { contentItemId_viewerId: { contentItemId, viewerId } },
              select: { type: true },
            })
          : null,
    ]);
    return {
      likes,
      dislikes,
      userReaction: userReaction?.type || null,
    };
  }

  async react(
    contentItemId: string,
    userId: string | undefined,
    viewerId: string | undefined,
    type: ReactionType,
  ) {
    if (!userId && !viewerId) {
      throw new BadRequestException('viewer required');
    }

    if (userId) {
      await this.prisma.reaction.upsert({
        where: { contentItemId_userId: { contentItemId, userId } },
        update: { type },
        create: { contentItemId, userId, type },
      });
    } else {
      await this.prisma.reaction.upsert({
        where: { contentItemId_viewerId: { contentItemId, viewerId: viewerId! } },
        update: { type },
        create: { contentItemId, viewerId: viewerId!, type },
      });
    }

    return this.getReactions(contentItemId, userId, viewerId);
  }

  async getComments(contentItemId: string) {
    const comments = await this.prisma.comment.findMany({
      where: { contentItemId, status: 'approved' },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            memberProfile: { select: { displayName: true } },
          },
        },
      },
    });
    return comments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt,
      author: c.user?.memberProfile?.displayName || c.user?.username || 'Аноним',
    }));
  }

  async createComment(contentItemId: string, userId: string, body: string) {
    const comment = await this.prisma.comment.create({
      data: {
        contentItemId,
        userId,
        body: body.trim(),
        status: 'approved',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            memberProfile: { select: { displayName: true } },
          },
        },
      },
    });
    return {
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      status: comment.status,
      author: comment.user?.memberProfile?.displayName || comment.user?.username || 'Аноним',
    };
  }
}
