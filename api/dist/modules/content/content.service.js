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
            where.categories = { some: { slug: dto.categorySlug } };
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
            select: { id: true, name: true, slug: true },
        });
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
        const result = await Promise.all(categories.map(async (category) => {
            const items = await this.prisma.contentItem.findMany({
                where: {
                    status: client_1.ContentStatus.published,
                    categories: { some: { id: category.id } },
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
                where: { homepageLead: true, status: client_1.ContentStatus.published },
                include: contentInclude,
                orderBy: { publishedAt: 'desc' },
                take: 5,
            }),
            this.prisma.contentItem.findMany({
                where: { type: client_1.ContentType.article, status: client_1.ContentStatus.published },
                include: contentInclude,
                orderBy: { publishedAt: 'desc' },
                take: 10,
            }),
            this.prisma.contentItem.findMany({
                where: { type: client_1.ContentType.news, status: client_1.ContentStatus.published },
                include: contentInclude,
                orderBy: { publishedAt: 'desc' },
                take: 10,
            }),
            this.prisma.contentItem.findMany({
                where: { type: client_1.ContentType.video, status: client_1.ContentStatus.published },
                include: contentInclude,
                orderBy: { publishedAt: 'desc' },
                take: 6,
            }),
            this.prisma.contentItem.findMany({
                where: { type: client_1.ContentType.gallery, status: client_1.ContentStatus.published },
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
};
exports.ContentService = ContentService;
exports.ContentService = ContentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContentService);
//# sourceMappingURL=content.service.js.map