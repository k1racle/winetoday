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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async increment(dto) {
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
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
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
    async summary(contentType, contentId) {
        const [item, total] = await Promise.all([
            this.prisma.contentItem.findUnique({
                where: { id: contentId },
                select: { viewsTotal: true },
            }),
            this.prisma.contentViewTotal.findUnique({
                where: {
                    contentType_contentId: {
                        contentType: contentType,
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
    viewsField(type) {
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
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map