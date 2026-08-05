import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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
  personLinks: {
    include: {
      person: {
        select: {
          id: true,
          slug: true,
          name: true,
        },
      },
    },
  },
  terroirLinks: {
    include: {
      terroir: {
        select: {
          id: true,
          slug: true,
          name: true,
        },
      },
    },
  },
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

    if (dto.search?.trim()) {
      const term = dto.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { excerpt: { contains: term, mode: 'insensitive' } },
        { author: { name: { contains: term, mode: 'insensitive' } } },
        { tags: { some: { name: { contains: term, mode: 'insensitive' } } } },
        { categories: { some: { name: { contains: term, mode: 'insensitive' } } } },
      ];
    }

    const orderBy: Prisma.ContentItemOrderByWithRelationInput[] =
      dto.sort === 'old'
        ? [{ publishedAt: 'asc' }, { createdAt: 'asc' }]
        : dto.sort === 'popular'
          ? [{ viewsTotal: 'desc' }, { publishedAt: 'desc' }]
          : dto.sort === 'author'
            ? [{ author: { name: 'asc' } }, { publishedAt: 'desc' }]
            : [{ pinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }];

    const [items, total] = await Promise.all([
      this.prisma.contentItem.findMany({
        where,
        include: contentInclude,
        orderBy,
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

    const include =
      type === ContentType.video
        ? ({ ...contentInclude, author: false } as const)
        : contentInclude;

    const item = (await this.prisma.contentItem.findUnique({
      where,
      include,
    })) as ContentItemWithRelations | null;

    if (!item) {
      throw new NotFoundException(`${type} not found`);
    }

    if (!options?.preview) {
      if (item.status !== ContentStatus.published) {
        throw new NotFoundException(`${type} not found`);
      }
      if (item.publishedAt && item.publishedAt > new Date()) {
        throw new NotFoundException(`${type} not found`);
      }
    }

    return item;
  }

  async findRelated(type: ContentType, slug: string) {
    const current = await this.prisma.contentItem.findUnique({
      where: { type_slug: { type, slug } },
      include: { tags: { select: { id: true } }, categories: { select: { id: true } } },
    });

    if (!current) {
      throw new NotFoundException(`${type} not found`);
    }

    const publishedWhere: Prisma.ContentItemWhereInput = {
      type,
      status: ContentStatus.published,
      publishedAt: { lte: new Date() },
      id: { not: current.id },
    };

    const tagIds = current.tags.map((tag) => tag.id);
    const categoryIds = current.categories.map((category) => category.id);

    if (!tagIds.length && !categoryIds.length) {
      const items = await this.prisma.contentItem.findMany({
        where: publishedWhere,
        include: contentInclude,
        orderBy: { publishedAt: 'desc' },
        take: 8,
      });
      return { items };
    }

    const candidates = await this.prisma.contentItem.findMany({
      where: {
        ...publishedWhere,
        OR: [
          ...(tagIds.length ? [{ tags: { some: { id: { in: tagIds } } } }] : []),
          ...(categoryIds.length
            ? [{ categories: { some: { id: { in: categoryIds } } } }]
            : []),
        ],
      },
      include: contentInclude,
      orderBy: { publishedAt: 'desc' },
      take: 60,
    });

    const tagIdSet = new Set(tagIds);
    const categoryIdSet = new Set(categoryIds);

    const scored = candidates.map((item) => ({
      item,
      tagMatches: item.tags.filter((tag) => tagIdSet.has(tag.id)).length,
      categoryMatches: item.categories.filter((category) => categoryIdSet.has(category.id)).length,
    }));

    scored.sort((a, b) => {
      if (b.tagMatches !== a.tagMatches) return b.tagMatches - a.tagMatches;
      if (b.categoryMatches !== a.categoryMatches) return b.categoryMatches - a.categoryMatches;
      return (b.item.publishedAt?.getTime() || 0) - (a.item.publishedAt?.getTime() || 0);
    });

    return { items: scored.slice(0, 8).map((entry) => entry.item) };
  }

  async findNeighbors(type: ContentType, slug: string) {
    const current = await this.prisma.contentItem.findUnique({
      where: { type_slug: { type, slug } },
      select: { id: true, publishedAt: true, status: true },
    });

    if (
      !current ||
      current.status !== ContentStatus.published ||
      (current.publishedAt && current.publishedAt > new Date())
    ) {
      throw new NotFoundException(`${type} not found`);
    }

    const neighborSelect = {
      id: true,
      title: true,
      slug: true,
      type: true,
      coverMedia: true,
    } satisfies Prisma.ContentItemSelect;

    const baseWhere: Prisma.ContentItemWhereInput = {
      type,
      status: ContentStatus.published,
      id: { not: current.id },
    };

    const referenceDate = current.publishedAt || new Date();

    const [next, prev] = await Promise.all([
      this.prisma.contentItem.findFirst({
        where: { ...baseWhere, publishedAt: { gt: referenceDate, lte: new Date() } },
        select: neighborSelect,
        orderBy: { publishedAt: 'asc' },
      }),
      this.prisma.contentItem.findFirst({
        where: { ...baseWhere, publishedAt: { lt: referenceDate } },
        select: neighborSelect,
        orderBy: { publishedAt: 'desc' },
      }),
    ]);

    return { prev, next };
  }

  async findCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        _count: {
          select: {
            contentItems: {
              where: {
                status: ContentStatus.published,
                publishedAt: { lte: new Date() },
              },
            },
          },
        },
      },
    });

    // Roll up counts from descendants: a rubric counts as non-empty
    // when any of its child categories has published materials.
    const byId = new Map(categories.map((c) => [c.id, c]));
    const totals = new Map<string, number>();
    for (const category of categories) {
      let current: (typeof categories)[number] | undefined = category;
      const seen = new Set<string>();
      while (current && !seen.has(current.id)) {
        seen.add(current.id);
        totals.set(
          current.id,
          (totals.get(current.id) ?? 0) + category._count.contentItems,
        );
        current = current.parentId ? byId.get(current.parentId) : undefined;
      }
    }

    return categories.map(({ _count, ...category }) => ({
      ...category,
      publishedCount: totals.get(category.id) ?? 0,
    }));
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
    const homepage = await this.prisma.homepage.findFirst();

    const fetchOrdered = async (
      ids: string[],
      extraWhere: Record<string, unknown> = {},
    ) => {
      if (!ids.length) return [];
      const items = await this.prisma.contentItem.findMany({
        where: {
          id: { in: ids },
          status: ContentStatus.published,
          publishedAt: { lte: new Date() },
          ...extraWhere,
        },
        include: contentInclude,
      });
      const map = new Map(items.map((item) => [item.id, item]));
      return ids.map((id) => map.get(id)).filter(Boolean) as ContentItemWithRelations[];
    };

    const lead = homepage?.leadItemIds?.length
      ? await fetchOrdered(homepage.leadItemIds)
      : await this.prisma.contentItem.findMany({
          where: { homepageSpecialBlock: true, status: ContentStatus.published, publishedAt: { lte: new Date() } },
          include: contentInclude,
          orderBy: { publishedAt: 'desc' },
          take: 5,
        });

    const leadIds = lead.map((item) => item.id);

    const featuredId = homepage?.videoItemIds?.[0];
    const [featured] = featuredId
      ? await this.prisma.contentItem.findMany({
          where: {
            id: featuredId,
            type: ContentType.video,
            status: ContentStatus.published,
            publishedAt: { lte: new Date() },
          },
          include: contentInclude,
        })
      : [];

    const autoVideos = await this.prisma.contentItem.findMany({
      where: {
        type: ContentType.video,
        status: ContentStatus.published,
        publishedAt: { lte: new Date() },
        id: { notIn: [...leadIds, featuredId].filter(Boolean) as string[] },
      },
      include: contentInclude,
      orderBy: { publishedAt: 'desc' },
      take: 10,
    });

    const videos = featured ? [featured, ...autoVideos] : autoVideos;

    const videoIds = videos.map((item) => item.id);
    const excludeIds = Array.from(new Set([...leadIds, ...videoIds]));

    const [articles, news, galleries] = await Promise.all([
      this.prisma.contentItem.findMany({
        where: {
          type: ContentType.article,
          status: ContentStatus.published,
          publishedAt: { lte: new Date() },
          id: { notIn: excludeIds },
        },
        include: contentInclude,
        orderBy: { publishedAt: 'desc' },
        take: 20,
      }),
      this.prisma.contentItem.findMany({
        where: {
          type: ContentType.news,
          status: ContentStatus.published,
          publishedAt: { lte: new Date() },
          id: { notIn: excludeIds },
        },
        include: contentInclude,
        orderBy: { publishedAt: 'desc' },
        take: 40,
      }),
      this.prisma.contentItem.findMany({
        where: {
          type: ContentType.gallery,
          status: ContentStatus.published,
          publishedAt: { lte: new Date() },
          id: { notIn: excludeIds },
        },
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
      userId: c.userId,
    }));
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true, contentItemId: true },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (!user || !['admin', 'editor'].includes(user.role)) {
        throw new ForbiddenException('Not allowed to delete this comment');
      }
    }
    await this.prisma.comment.delete({ where: { id: commentId } });
    return this.getComments(comment.contentItemId);
  }

  async createComment(contentItemId: string, userId: string, body: string) {
    await this.assertNoStopWords(body);

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

  // Стоп-слова сравниваются по началу слова: «хуй» режет «хуйня», но «еб» не трогает «требование».
  private async assertNoStopWords(body: string) {
    const stopWords = await this.prisma.commentStopWord.findMany({
      select: { word: true },
    });
    if (!stopWords.length) return;

    const text = body.toLowerCase();
    const hit = stopWords.some(({ word }) => {
      const escaped = this.escapeRegex(word.toLowerCase());
      return new RegExp(`(^|[^a-zа-яё0-9])${escaped}`, 'iu').test(text);
    });
    if (hit) {
      throw new BadRequestException('Комментарий содержит запрещённые слова');
    }
  }
}
