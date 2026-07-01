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
let EditorService = class EditorService {
    constructor(prisma) {
        this.prisma = prisma;
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
        const data = {
            type,
            title: dto.title.trim(),
            slug,
            excerpt: dto.excerpt?.trim() || null,
            status: dto.status ?? client_1.ContentStatus.draft,
            publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
            materialLabel: dto.materialLabel || null,
            featured: dto.featured ?? false,
            homepageSpecialBlock: dto.homepageSpecialBlock ?? false,
            coverMediaId: dto.coverMediaId || null,
            coverShowWatermark: dto.coverShowWatermark ?? false,
            videoUrl: dto.videoUrl || null,
            authorId,
            contentBlocks: Array.isArray(dto.contentBlocks) ? dto.contentBlocks : [],
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
        await this.prisma.memberProfile.update({
            where: { userId: user.userId },
            data: { authorId: author.id },
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EditorService);
//# sourceMappingURL=editor.service.js.map