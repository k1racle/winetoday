import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ContentStatus, ContentType, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MediaService } from '../media/media.service';
import { CreateDraftDto } from './dto/create-draft.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

const CYRILLIC_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

function translit(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((ch) => CYRILLIC_MAP[ch] ?? ch)
    .join('');
}

function slugify(text: string): string {
  return translit(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export type RequestUser = {
  userId: string;
  email: string;
  role: Role;
};

@Injectable()
export class EditorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
  ) {}

  async saveDraft(user: RequestUser, dto: CreateDraftDto) {
    let authorId = dto.type === 'video' ? null : await this.ensureAuthorId(user);
    if (dto.authorId && user.role === Role.admin) {
      authorId = dto.authorId;
    }

    const type = dto.type;
    let slug = dto.slug?.trim();
    if (!slug) {
      slug = slugify(dto.title) || `draft-${Date.now()}`;
    }
    slug = slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');

    await this.ensureUniqueSlug(type, slug, dto.id);

    const contentBlocks = Array.isArray(dto.contentBlocks) ? dto.contentBlocks : [];

    const isPublishing = dto.status === ContentStatus.published;
    const isScheduling = dto.status === ContentStatus.scheduled;

    // Authors can only save drafts
    if (user.role === Role.author) {
      dto.status = ContentStatus.draft;
      dto.publishedAt = undefined;
    }

    if (isScheduling && !dto.publishedAt) {
      throw new BadRequestException('Scheduled publication requires a date and time');
    }

    const publishedAt = dto.publishedAt
      ? new Date(dto.publishedAt)
      : isPublishing
        ? new Date()
        : null;

    const data: Prisma.ContentItemUncheckedCreateInput = {
      type,
      title: dto.title.trim(),
      slug,
      excerpt: dto.excerpt?.trim() || null,
      status: dto.status ?? ContentStatus.draft,
      publishedAt,
      materialLabel: dto.materialLabel || null,
      featured: dto.featured ?? false,
      coverMediaId: dto.coverMediaId || null,
      archiveCoverMediaId: dto.archiveCoverMediaId || null,
      coverSource: dto.coverSource?.trim() || null,
      videoUrl: dto.videoUrl || null,
      duration: dto.duration ?? null,
      authorId,
      contentBlocks: contentBlocks as any,
      sources: Array.isArray(dto.sources) ? (dto.sources as any) : [],
      seo: dto.seo && typeof dto.seo === 'object' ? (dto.seo as any) : {},
    };

    const connectCategories =
      dto.categoryIds?.length
        ? { connect: dto.categoryIds.map((id) => ({ id })) }
        : undefined;

    const connectTags =
      dto.tagIds?.length
        ? { connect: dto.tagIds.map((id) => ({ id })) }
        : undefined;

    const result = dto.id
      ? await this.prisma.contentItem.update({
          where: { id: dto.id },
          data: {
            ...data,
            categories: connectCategories ? { set: [], ...connectCategories } : { set: [] },
            tags: connectTags ? { set: [], ...connectTags } : { set: [] },
          },
          include: {
            author: true,
            coverMedia: true,
            archiveCoverMedia: true,
            categories: true,
            tags: true,
          },
        })
      : await this.prisma.contentItem.create({
          data: {
            ...data,
            categories: connectCategories,
            tags: connectTags,
          },
          include: {
            author: true,
            coverMedia: true,
            archiveCoverMedia: true,
            categories: true,
            tags: true,
          },
        });

    return result;
  }

  async findDraft(user: RequestUser, id: string) {
    const item = await this.prisma.contentItem.findUnique({
      where: { id },
      include: { author: true, coverMedia: true, archiveCoverMedia: true, categories: true, tags: true },
    });
    if (!item) throw new NotFoundException('Draft not found');
    if (item.authorId && !(await this.canEdit(user, item.authorId))) {
      throw new ForbiddenException();
    }
    return item;
  }

  async listMaterials(
    user: RequestUser,
    options: {
      type?: string;
      status?: string;
      search?: string;
      authorId?: string;
      authorName?: string;
      limit?: number;
      offset?: number;
      sort?: string;
      order?: 'asc' | 'desc';
    } = {},
  ) {
    const where: Prisma.ContentItemWhereInput = {};
    if (user.role !== Role.admin && user.role !== Role.editor) {
      const authorId = await this.ensureAuthorId(user);
      where.authorId = authorId;
    } else if (options.authorName?.trim()) {
      const authors = await this.prisma.author.findMany({
        where: { name: { equals: options.authorName.trim(), mode: 'insensitive' } },
        select: { id: true },
      });
      where.authorId = { in: authors.map((a) => a.id) };
    } else if (options.authorId) {
      where.authorId = options.authorId;
    }

    if (options.type) {
      where.type = options.type as ContentType;
    }
    if (options.status) {
      where.status = options.status as ContentStatus;
    }
    if (options.search?.trim()) {
      where.title = { contains: options.search.trim(), mode: 'insensitive' };
    }

    const sortField = options.sort || 'publishedAt';
    const sortOrder = options.order === 'asc' ? 'asc' : 'desc';

    const allowedSortFields: Record<string, any> = {
      title: { title: sortOrder },
      type: { type: sortOrder },
      status: { status: sortOrder },
      publishedAt: { publishedAt: sortOrder },
      updatedAt: { updatedAt: sortOrder },
      viewsTotal: { viewsTotal: sortOrder },
      author: { author: { name: sortOrder } },
    };

    const baseOrder = allowedSortFields[sortField] || { publishedAt: sortOrder };
    const orderBy = [baseOrder, { createdAt: sortOrder }, { pinned: 'desc' }];

    const [items, total] = await Promise.all([
      this.prisma.contentItem.findMany({
        where,
        orderBy,
        take: options.limit || 30,
        skip: options.offset || 0,
        select: {
          id: true,
          type: true,
          title: true,
          slug: true,
          status: true,
          publishedAt: true,
          updatedAt: true,
          coverMedia: { select: { path: true } },
          author: { select: { id: true, name: true } },
          authorId: true,
          viewsTotal: true,
        },
      }),
      this.prisma.contentItem.count({ where }),
    ]);

    const countWhere = { ...where };
    delete countWhere.type;

    const counts = await this.prisma.contentItem.groupBy({
      by: ['type'],
      where: countWhere,
      _count: { type: true },
    });

    const contentIds = items.map((item) => item.id);
    const [likesCounts, commentsCounts] = await Promise.all([
      this.prisma.reaction.groupBy({
        by: ['contentItemId'],
        where: { contentItemId: { in: contentIds }, type: 'like' },
        _count: { contentItemId: true },
      }),
      this.prisma.comment.groupBy({
        by: ['contentItemId'],
        where: { contentItemId: { in: contentIds } },
        _count: { contentItemId: true },
      }),
    ]);
    const likesById = new Map(likesCounts.map((c) => [c.contentItemId, c._count.contentItemId]));
    const commentsById = new Map(commentsCounts.map((c) => [c.contentItemId, c._count.contentItemId]));

    const itemsWithCounts = items.map((item) => ({
      ...item,
      likesCount: likesById.get(item.id) || 0,
      commentsCount: commentsById.get(item.id) || 0,
    }));

    return { items: itemsWithCounts, total, counts };
  }

  async deleteMaterial(user: RequestUser, id: string) {
    const item = await this.prisma.contentItem.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });
    if (!item) throw new NotFoundException('Material not found');
    if (item.authorId && !(await this.canEdit(user, item.authorId))) {
      throw new ForbiddenException();
    }
    await this.prisma.contentItem.delete({ where: { id } });
    return { id, deleted: true };
  }

  async exportMaterialsCsv(user: RequestUser) {
    if (user.role !== Role.admin && user.role !== Role.editor) {
      const authorId = await this.ensureAuthorId(user);
      const items = await this.prisma.contentItem.findMany({
        where: { authorId },
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          type: true,
          title: true,
          slug: true,
          status: true,
          publishedAt: true,
          updatedAt: true,
          viewsTotal: true,
          author: { select: { name: true } },
        },
      });
      return this.buildCsv(items);
    }

    const items = await this.prisma.contentItem.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        type: true,
        title: true,
        slug: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
        viewsTotal: true,
        author: { select: { name: true } },
      },
    });
    return this.buildCsv(items);
  }

  private buildCsv(
    items: Array<{
      id: string;
      type: string;
      title: string;
      slug: string;
      status: string;
      publishedAt: Date | null;
      updatedAt: Date;
      viewsTotal: number;
      author: { name: string | null } | null;
    }>,
  ): string {
    const headers = ['ID', 'Тип', 'Заголовок', 'Slug', 'Статус', 'Опубликовано', 'Обновлено', 'Просмотры', 'Автор'];
    const rows = items.map((item) => [
      item.id,
      item.type,
      item.title,
      item.slug,
      item.status,
      item.publishedAt ? item.publishedAt.toISOString() : '',
      item.updatedAt.toISOString(),
      String(item.viewsTotal),
      item.author?.name || '',
    ]);
    const escape = (val: string) => {
      const s = String(val ?? '').replace(/"/g, '""');
      return /[",\n\r]/.test(s) ? `"${s}"` : s;
    };
    return [headers.map(escape).join(','), ...rows.map((row) => row.map(escape).join(','))].join('\n');
  }

  async listAuthors() {
    return this.prisma.author.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    });
  }

  async listAuthorsAdmin() {
    const authors = await this.prisma.author.findMany({
      orderBy: [{ name: 'asc' }, { slug: 'asc' }],
      include: {
        _count: { select: { contentItems: true } },
      },
    });

    // Связь с пользователем идёт через member_profiles.authorId (это реальный FK),
    // а не через authors.memberProfileId, который в старой БД мог оставаться пустым.
    const authorIds = authors.map((a) => a.id);
    const memberProfiles = await this.prisma.memberProfile.findMany({
      where: { authorId: { in: authorIds } },
      include: {
        user: { select: { id: true, email: true, username: true, role: true } },
      },
    });
    const profileByAuthorId = new Map<string, (typeof memberProfiles)[0]>();
    for (const profile of memberProfiles) {
      if (profile.authorId) {
        profileByAuthorId.set(profile.authorId, profile);
      }
    }

    const groups = new Map<
      string,
      {
        representatives: typeof authors;
        totalMaterials: number;
      }
    >();

    for (const author of authors) {
      const key = author.name.trim().toLowerCase();
      const existing = groups.get(key);
      const count = author._count.contentItems;
      if (!existing) {
        groups.set(key, { representatives: [author], totalMaterials: count });
      } else {
        existing.representatives.push(author);
        existing.totalMaterials += count;
      }
    }

    const result = Array.from(groups.values()).map((group) => {
      const representative = group.representatives.sort((a, b) => {
        const aHasUser = profileByAuthorId.get(a.id)?.user ? 1 : 0;
        const bHasUser = profileByAuthorId.get(b.id)?.user ? 1 : 0;
        if (aHasUser !== bHasUser) return bHasUser - aHasUser;
        const aCount = a._count.contentItems;
        const bCount = b._count.contentItems;
        if (aCount !== bCount) return bCount - aCount;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      })[0];

      const profile = profileByAuthorId.get(representative.id);

      return {
        id: representative.id,
        name: representative.name,
        slug: representative.slug,
        position: representative.position,
        materialsCount: group.totalMaterials,
        user: profile?.user
          ? {
              id: profile.user.id,
              email: profile.user.email,
              username: profile.user.username,
              role: profile.user.role,
            }
          : null,
      };
    });

    return result.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }

  async getAuthorAnalytics(authorId: string) {
    const author = await this.prisma.author.findUnique({
      where: { id: authorId },
      include: { avatarMedia: true },
    });

    if (!author) {
      throw new NotFoundException('Author not found');
    }

    // Load the linked user through member_profile.authorId, which is the actual FK.
    const memberProfile = await this.prisma.memberProfile.findUnique({
      where: { authorId },
      include: {
        user: { select: { id: true, email: true, username: true, role: true } },
      },
    });

    // Aggregate all author duplicates by name (case-insensitive) so the cabinet
    // shows the combined stats regardless of which duplicate was picked in the list.
    const allAuthors = await this.prisma.author.findMany({
      where: { name: { equals: author.name, mode: 'insensitive' } },
      select: { id: true },
    });
    const authorIds = allAuthors.map((a) => a.id);

    const materials = await this.prisma.contentItem.findMany({
      where: { authorId: { in: authorIds } },
      orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }],
      select: {
        id: true,
        type: true,
        title: true,
        slug: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
        viewsTotal: true,
      },
    });

    const dailyRaw = await this.prisma.authorViewDaily.findMany({
      where: { authorId: { in: authorIds } },
      select: {
        date: true,
        articleViews: true,
        newsViews: true,
        videoViews: true,
        galleryViews: true,
        totalViews: true,
      },
    });

    const dailyMap = new Map<string, {
      date: string;
      articleViews: number;
      newsViews: number;
      videoViews: number;
      galleryViews: number;
      totalViews: number;
    }>();

    for (const day of dailyRaw) {
      const key = day.date.toISOString().slice(0, 10);
      const existing = dailyMap.get(key);
      if (!existing) {
        dailyMap.set(key, {
          date: key,
          articleViews: day.articleViews || 0,
          newsViews: day.newsViews || 0,
          videoViews: day.videoViews || 0,
          galleryViews: day.galleryViews || 0,
          totalViews: day.totalViews || 0,
        });
      } else {
        existing.articleViews += day.articleViews || 0;
        existing.newsViews += day.newsViews || 0;
        existing.videoViews += day.videoViews || 0;
        existing.galleryViews += day.galleryViews || 0;
        existing.totalViews += day.totalViews || 0;
      }
    }

    const dailyViews = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    const totalViews = dailyViews.reduce((sum, day) => sum + day.totalViews, 0);

    return {
      author: {
        ...author,
        user: memberProfile?.user
          ? {
              id: memberProfile.user.id,
              email: memberProfile.user.email,
              username: memberProfile.user.username,
              role: memberProfile.user.role,
            }
          : null,
      },
      materials,
      totalViews,
      dailyViews,
    };
  }

  async createAuthor(dto: CreateAuthorDto) {
    const name = dto.name?.trim();
    if (!name) {
      throw new BadRequestException('Name is required');
    }

    let slug = dto.slug?.trim();
    if (!slug) {
      slug = slugify(name) || `author-${Date.now()}`;
    }
    slug = slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');

    const slugTaken = await this.prisma.author.findUnique({ where: { slug } });
    if (slugTaken) {
      throw new BadRequestException('Slug already in use');
    }

    return this.prisma.author.create({
      data: {
        name,
        slug,
        position: dto.position?.trim() || null,
        bio: dto.bio?.trim() || null,
        avatarMediaId: dto.avatarMediaId || null,
      },
      include: { avatarMedia: true },
    });
  }

  async updateAuthor(id: string, dto: UpdateAuthorDto) {
    const existing = await this.prisma.author.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Author not found');
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const slugTaken = await this.prisma.author.findUnique({ where: { slug: dto.slug } });
      if (slugTaken) {
        throw new BadRequestException('Slug already in use');
      }
    }

    return this.prisma.author.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.position !== undefined && { position: dto.position }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.avatarMediaId !== undefined && { avatarMediaId: dto.avatarMediaId || null }),
      },
      include: { avatarMedia: true },
    });
  }

  async deleteAuthor(id: string) {
    const existing = await this.prisma.author.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Author not found');
    }
    await this.prisma.$transaction([
      this.prisma.memberProfile.updateMany({
        where: { authorId: id },
        data: { authorId: null },
      }),
      this.prisma.contentItem.updateMany({
        where: { authorId: id },
        data: { authorId: null },
      }),
      this.prisma.author.delete({ where: { id } }),
    ]);
    return { success: true };
  }

  private async ensureAuthorId(user: RequestUser): Promise<string> {
    const profile = await this.prisma.memberProfile.findUnique({
      where: { userId: user.userId },
      select: { authorId: true, displayName: true },
    });

    if (profile?.authorId) {
      return profile.authorId;
    }

    const name = profile?.displayName?.trim() || user.email.split('@')[0];
    const baseSlug = slugify(name) || `author-${Date.now()}`;
    let slug = baseSlug;
    let suffix = 1;
    while (await this.prisma.author.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const author = await this.prisma.author.create({
      data: { name, slug },
    });

    await this.prisma.memberProfile.upsert({
      where: { userId: user.userId },
      update: { authorId: author.id },
      create: { userId: user.userId, displayName: name, authorId: author.id },
    });

    return author.id;
  }

  private async ensureUniqueSlug(type: ContentType, slug: string, excludeId?: string) {
    const existing = await this.prisma.contentItem.findUnique({
      where: { type_slug: { type, slug } },
    });
    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(`Slug "${slug}" already exists for this content type`);
    }
  }

  private async canEdit(user: RequestUser, authorId: string): Promise<boolean> {
    if (user.role === Role.admin || user.role === Role.editor) return true;
    const profile = await this.prisma.memberProfile.findUnique({
      where: { userId: user.userId },
      select: { authorId: true },
    });
    return profile?.authorId === authorId;
  }
}
