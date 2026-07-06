"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const media_service_1 = require("../media/media.service");
const CYRILLIC_MAP = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z',
    и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
    с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
    ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};
function translit(text) {
    return text
        .toLowerCase()
        .split('')
        .map((ch) => CYRILLIC_MAP[ch] ?? ch)
        .join('');
}
function slugify(text) {
    return translit(text)
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 100);
}
function stripWatermarkSuffix(filePath) {
    return filePath.replace(/_wm(\.[^.]+)$/, '$1');
}
let EditorService = class EditorService {
    constructor(prisma, mediaService) {
        this.prisma = prisma;
        this.mediaService = mediaService;
    }
    async saveDraft(user, dto) {
        let authorId = await this.ensureAuthorId(user);
        if (dto.authorId) {
            if (user.role === client_1.Role.admin) {
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
        if (dto.coverShowWatermark && dto.coverMediaId) {
            await this.mediaService.ensureWatermark(dto.coverMediaId);
        }
        const contentBlocks = Array.isArray(dto.contentBlocks) ? dto.contentBlocks : [];
        for (const block of contentBlocks) {
            if (block.type === 'image' && block.data?.mediaId) {
                if (block.data.showWatermark) {
                    const newPath = await this.mediaService.ensureWatermark(block.data.mediaId);
                    if (newPath)
                        block.data.path = newPath;
                }
                else if (block.data.path?.includes('_wm')) {
                    block.data.path = stripWatermarkSuffix(block.data.path);
                }
                continue;
            }
            if ((block.type === 'slider' || block.type === 'gallery') && Array.isArray(block.data?.items)) {
                const legacyBlockWatermark = block.data.showWatermark === true;
                for (const item of block.data.items) {
                    if (!item.mediaId)
                        continue;
                    if (legacyBlockWatermark || item.showWatermark) {
                        const newPath = await this.mediaService.ensureWatermark(item.mediaId);
                        if (newPath)
                            item.path = newPath;
                    }
                    else if (item.path?.includes('_wm')) {
                        item.path = stripWatermarkSuffix(item.path);
                    }
                }
            }
        }
        const isPublishing = dto.status === client_1.ContentStatus.published;
        const publishedAt = dto.publishedAt
            ? new Date(dto.publishedAt)
            : isPublishing
                ? new Date()
                : null;
        const data = {
            type,
            title: dto.title.trim(),
            slug,
            excerpt: dto.excerpt?.trim() || null,
            status: dto.status ?? client_1.ContentStatus.draft,
            publishedAt,
            materialLabel: dto.materialLabel || null,
            featured: dto.featured ?? false,
            homepageSpecialBlock: dto.homepageSpecialBlock ?? false,
            coverMediaId: dto.coverMediaId || null,
            coverShowWatermark: dto.coverShowWatermark ?? false,
            videoUrl: dto.videoUrl || null,
            duration: dto.duration ?? null,
            authorId,
            contentBlocks: contentBlocks,
            sources: Array.isArray(dto.sources) ? dto.sources : [],
            seo: dto.seo && typeof dto.seo === 'object' ? dto.seo : {},
        };
        const connectCategories = dto.categoryIds?.length
            ? { connect: dto.categoryIds.map((id) => ({ id })) }
            : undefined;
        const connectTags = dto.tagIds?.length
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
    async findDraft(user, id) {
        const item = await this.prisma.contentItem.findUnique({
            where: { id },
            include: { author: true, coverMedia: true, categories: true, tags: true },
        });
        if (!item)
            throw new common_1.NotFoundException('Draft not found');
        if (item.authorId && !(await this.canEdit(user, item.authorId))) {
            throw new common_1.ForbiddenException();
        }
        return item;
    }
    async listMaterials(user, options = {}) {
        const where = {};
        if (user.role !== client_1.Role.admin && user.role !== client_1.Role.editor) {
            const authorId = await this.ensureAuthorId(user);
            where.authorId = authorId;
        }
        else if (options.authorName?.trim()) {
            const authors = await this.prisma.author.findMany({
                where: { name: { equals: options.authorName.trim(), mode: 'insensitive' } },
                select: { id: true },
            });
            where.authorId = { in: authors.map((a) => a.id) };
        }
        else if (options.authorId) {
            where.authorId = options.authorId;
        }
        if (options.type) {
            where.type = options.type;
        }
        if (options.status) {
            where.status = options.status;
        }
        if (options.search?.trim()) {
            where.title = { contains: options.search.trim(), mode: 'insensitive' };
        }
        const sortField = options.sort || 'updatedAt';
        const sortOrder = options.order === 'asc' ? 'asc' : 'desc';
        const allowedSortFields = {
            title: { title: sortOrder },
            type: { type: sortOrder },
            status: { status: sortOrder },
            publishedAt: { publishedAt: sortOrder },
            updatedAt: { updatedAt: sortOrder },
            viewsTotal: { viewsTotal: sortOrder },
            author: { author: { name: sortOrder } },
        };
        const orderBy = allowedSortFields[sortField]
            ? [allowedSortFields[sortField], { pinned: 'desc' }]
            : [{ pinned: 'desc' }, { updatedAt: 'desc' }];
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
        const groups = new Map();
        for (const author of authors) {
            const key = author.name.trim().toLowerCase();
            const existing = groups.get(key);
            const count = author._count.contentItems;
            if (!existing) {
                groups.set(key, { representatives: [author], totalMaterials: count });
            }
            else {
                existing.representatives.push(author);
                existing.totalMaterials += count;
            }
        }
        const result = Array.from(groups.values()).map((group) => {
            const representative = group.representatives.sort((a, b) => {
                const aHasUser = a.memberProfile?.user ? 1 : 0;
                const bHasUser = b.memberProfile?.user ? 1 : 0;
                if (aHasUser !== bHasUser)
                    return bHasUser - aHasUser;
                const aCount = a._count.contentItems;
                const bCount = b._count.contentItems;
                if (aCount !== bCount)
                    return bCount - aCount;
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            })[0];
            return {
                id: representative.id,
                name: representative.name,
                slug: representative.slug,
                position: representative.position,
                materialsCount: group.totalMaterials,
                user: representative.memberProfile?.user
                    ? {
                        id: representative.memberProfile.user.id,
                        email: representative.memberProfile.user.email,
                        username: representative.memberProfile.user.username,
                        role: representative.memberProfile.user.role,
                    }
                    : null,
            };
        });
        return result.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    }
    async getAuthorAnalytics(authorId) {
        const author = await this.prisma.author.findUnique({
            where: { id: authorId },
            select: { id: true, name: true, slug: true, position: true, bio: true },
        });
        if (!author) {
            throw new common_1.NotFoundException('Author not found');
        }
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
        const dailyMap = new Map();
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
            }
            else {
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
            author,
            materials,
            totalViews,
            dailyViews,
        };
    }
    async ensureAuthorId(user) {
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
    async ensureUniqueSlug(type, slug, excludeId) {
        const existing = await this.prisma.contentItem.findUnique({
            where: { type_slug: { type, slug } },
        });
        if (existing && existing.id !== excludeId) {
            throw new common_1.BadRequestException(`Slug "${slug}" already exists for this content type`);
        }
    }
    async canEdit(user, authorId) {
        if (user.role === client_1.Role.admin || user.role === client_1.Role.editor)
            return true;
        const profile = await this.prisma.memberProfile.findUnique({
            where: { userId: user.userId },
            select: { authorId: true },
        });
        return profile?.authorId === authorId;
    }
};
exports.EditorService = EditorService;
exports.EditorService = EditorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        media_service_1.MediaService])
], EditorService);
//# sourceMappingURL=editor.service.js.map