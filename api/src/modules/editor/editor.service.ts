import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ContentStatus, ContentType, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDraftDto } from './dto/create-draft.dto';

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
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

export type RequestUser = {
  userId: string;
  email: string;
  role: Role;
};

@Injectable()
export class EditorService {
  constructor(private readonly prisma: PrismaService) {}

  async saveDraft(user: RequestUser, dto: CreateDraftDto) {
    let authorId = await this.ensureAuthorId(user);
    if (dto.authorId) {
      if (user.role === Role.admin) {
        authorId = dto.authorId;
      }
    }

    const type = dto.type;
    let slug = dto.slug?.trim();
    if (!slug) {
      slug = slugify(dto.title) || `draft-${Date.now()}`;
    }
    slug = slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '').slice(0, 100);

    await this.ensureUniqueSlug(type, slug, dto.id);

    const isPublishing = dto.status === ContentStatus.published;
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
      homepageSpecialBlock: dto.homepageSpecialBlock ?? false,
      coverMediaId: dto.coverMediaId || null,
      coverShowWatermark: dto.coverShowWatermark ?? false,
      videoUrl: dto.videoUrl || null,
      authorId,
      contentBlocks: Array.isArray(dto.contentBlocks) ? (dto.contentBlocks as any) : [],
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
            categories: true,
            tags: true,
          },
        });

    return result;
  }

  async findDraft(user: RequestUser, id: string) {
    const item = await this.prisma.contentItem.findUnique({
      where: { id },
      include: { author: true, coverMedia: true, categories: true, tags: true },
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
      limit?: number;
      offset?: number;
    } = {},
  ) {
    const where: Prisma.ContentItemWhereInput = {};
    if (user.role !== Role.admin && user.role !== Role.editor) {
      const authorId = await this.ensureAuthorId(user);
      where.authorId = authorId;
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

    const [items, total] = await Promise.all([
      this.prisma.contentItem.findMany({
        where,
        orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
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
          author: { select: { name: true } },
          viewsTotal: true,
        },
      }),
      this.prisma.contentItem.count({ where }),
    ]);

    const counts = await this.prisma.contentItem.groupBy({
      by: ['type'],
      where,
      _count: { type: true },
    });

    return { items, total, counts };
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
        memberProfile: {
          include: {
            user: { select: { id: true, email: true, username: true, role: true } },
          },
        },
        _count: { select: { contentItems: true } },
      },
    });

    return authors.map((a) => ({
      id: a.id,
      name: a.name,
      slug: a.slug,
      position: a.position,
      materialsCount: a._count.contentItems,
      user: a.memberProfile?.user
        ? {
            id: a.memberProfile.user.id,
            email: a.memberProfile.user.email,
            username: a.memberProfile.user.username,
            role: a.memberProfile.user.role,
          }
        : null,
    }));
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
