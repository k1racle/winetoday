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
exports.ContentService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const contentInclude = {
    author: true,
    coverMedia: true,
    archiveCoverMedia: true,
    categories: true,
    tags: true,
};
let ContentService = class ContentService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMany(dto) {
        const where = {
            type: dto.type,
        };
        if (dto.status) {
            where.status = dto.status;
        }
        else {
            where.status = client_1.ContentStatus.published;
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
    async findBySlug(type, slug, options) {
        const where = {
            type_slug: { type, slug },
        };
        const item = await this.prisma.contentItem.findUnique({
            where,
            include: contentInclude,
        });
        if (!item) {
            throw new common_1.NotFoundException(`${type} not found`);
        }
        if (!options?.preview && item.status !== client_1.ContentStatus.published) {
            throw new common_1.NotFoundException(`${type} not found`);
        }
        return item;
    }
    async findCategories() {
        return this.prisma.category.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true, slug: true, parentId: true },
        });
    }
    async getCategoryAndDescendantIds(slug) {
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
        const categoryMap = new Map();
        for (const c of allCategories) {
            categoryMap.set(c.id, c.parentId);
        }
        const descendantIds = [];
        const queue = [...matchingIds];
        while (queue.length > 0) {
            const currentId = queue.shift();
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
    escapeRegex(value) {
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
            orderBy: { name: 'asc' },
            select: { id: true, name: true, slug: true },
        });
        const EXCLUDED_CATEGORY_SLUGS = new Set(['afisha']);
        const duplicateSuffixPattern = /^(.*)-(\d+)$/;
        const groups = new Map();
        for (const category of categories) {
            const baseSlug = category.slug.replace(duplicateSuffixPattern, '$1');
            if (EXCLUDED_CATEGORY_SLUGS.has(baseSlug)) {
                continue;
            }
            const existing = groups.get(baseSlug);
            if (!existing) {
                groups.set(baseSlug, category);
            }
            else if (!duplicateSuffixPattern.test(category.slug)) {
                groups.set(baseSlug, category);
            }
        }
        const result = await Promise.all(Array.from(groups.values()).map(async (category) => {
            const categoryIds = await this.getCategoryAndDescendantIds(category.slug);
            const items = await this.prisma.contentItem.findMany({
                where: {
                    status: client_1.ContentStatus.published,
                    categories: categoryIds.length
                        ? { some: { id: { in: categoryIds } } }
                        : { some: { id: category.id } },
                    publishedAt: { lte: new Date() },
                },
                include: contentInclude,
                orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
                take: limit,
            });
            return { category, items };
        }));
        return result.filter((group) => group.items.length > 0);
    }
    async findHomepageContent() {
        const [lead, articles, news, videos, galleries] = await Promise.all([
            this.prisma.contentItem.findMany({
                where: { homepageLead: true, status: client_1.ContentStatus.published, publishedAt: { lte: new Date() } },
                include: contentInclude,
                orderBy: { publishedAt: 'desc' },
                take: 5,
            }),
            this.prisma.contentItem.findMany({
                where: { type: client_1.ContentType.article, status: client_1.ContentStatus.published, publishedAt: { lte: new Date() } },
                include: contentInclude,
                orderBy: { publishedAt: 'desc' },
                take: 20,
            }),
            this.prisma.contentItem.findMany({
                where: { type: client_1.ContentType.news, status: client_1.ContentStatus.published, publishedAt: { lte: new Date() } },
                include: contentInclude,
                orderBy: { publishedAt: 'desc' },
                take: 40,
            }),
            this.prisma.contentItem.findMany({
                where: { type: client_1.ContentType.video, status: client_1.ContentStatus.published, publishedAt: { lte: new Date() } },
                include: contentInclude,
                orderBy: { publishedAt: 'desc' },
                take: 10,
            }),
            this.prisma.contentItem.findMany({
                where: { type: client_1.ContentType.gallery, status: client_1.ContentStatus.published, publishedAt: { lte: new Date() } },
                include: contentInclude,
                orderBy: { publishedAt: 'desc' },
                take: 6,
            }),
        ]);
        return { lead, articles, news, videos, galleries };
    }
    async createCategory(dto) {
        return this.prisma.category.create({
            data: {
                name: dto.name,
                slug: dto.slug,
                parentId: dto.parentId || null,
            },
            select: { id: true, name: true, slug: true, parentId: true },
        });
    }
    async updateCategory(id, dto) {
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
    async deleteCategory(id) {
        await this.findCategoryOrThrow(id);
        return this.prisma.category.delete({ where: { id } });
    }
    async findCategoryOrThrow(id) {
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async createTag(dto) {
        return this.prisma.tag.create({
            data: { name: dto.name, slug: dto.slug },
            select: { id: true, name: true, slug: true },
        });
    }
    async updateTag(id, dto) {
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
    async deleteTag(id) {
        await this.findTagOrThrow(id);
        return this.prisma.tag.delete({ where: { id } });
    }
    async findTagOrThrow(id) {
        const tag = await this.prisma.tag.findUnique({ where: { id } });
        if (!tag) {
            throw new common_1.NotFoundException('Tag not found');
        }
        return tag;
    }
    async getReactions(contentItemId, userId) {
        const [likes, dislikes, userReaction] = await Promise.all([
            this.prisma.reaction.count({ where: { contentItemId, type: client_1.ReactionType.like } }),
            this.prisma.reaction.count({ where: { contentItemId, type: client_1.ReactionType.dislike } }),
            userId
                ? this.prisma.reaction.findUnique({
                    where: { contentItemId_userId: { contentItemId, userId } },
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
    async react(contentItemId, userId, type) {
        await this.prisma.reaction.upsert({
            where: { contentItemId_userId: { contentItemId, userId } },
            update: { type },
            create: { contentItemId, userId, type },
        });
        return this.getReactions(contentItemId, userId);
    }
    async getComments(contentItemId) {
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
    async createComment(contentItemId, userId, body) {
        const comment = await this.prisma.comment.create({
            data: {
                contentItemId,
                userId,
                body: body.trim(),
                status: 'pending',
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
};
exports.ContentService = ContentService;
exports.ContentService = ContentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContentService);
//# sourceMappingURL=content.service.js.map