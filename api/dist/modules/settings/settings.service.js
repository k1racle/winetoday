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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const singletonInclude = {
    logoMedia: true,
    watermarkMedia: true,
};
const headerInclude = {
    lightLogo: true,
    darkLogo: true,
};
const seoInclude = {
    openGraphImage: true,
    twitterImage: true,
};
let SettingsService = class SettingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async siteSettings() {
        return this.prisma.siteSettings.findFirst({
            include: singletonInclude,
        });
    }
    async homepage() {
        return this.prisma.homepage.findFirst();
    }
    async siteHeader() {
        return this.prisma.siteHeader.findFirst({
            include: headerInclude,
        });
    }
    async siteFooter() {
        return this.prisma.siteFooter.findFirst();
    }
    async siteSeo() {
        return this.prisma.siteSeo.findFirst({
            include: seoInclude,
        });
    }
    async watermark() {
        const settings = await this.prisma.siteSettings.findFirst({
            select: {
                watermarkEnabled: true,
                watermarkMediaId: true,
                watermarkOpacity: true,
                watermarkSizePercent: true,
                watermarkPosition: true,
                watermarkOffsetTopPercent: true,
                watermarkOffsetRightPercent: true,
                watermarkOffsetBottomPercent: true,
                watermarkOffsetLeftPercent: true,
                watermarkMinSizePx: true,
                watermarkMaxSizePx: true,
                watermarkMedia: true,
            },
        });
        if (!settings) {
            return null;
        }
        return {
            enabled: settings.watermarkEnabled,
            mediaId: settings.watermarkMediaId,
            media: settings.watermarkMedia,
            opacity: settings.watermarkOpacity,
            sizePercent: settings.watermarkSizePercent,
            position: settings.watermarkPosition,
            offsetTopPercent: settings.watermarkOffsetTopPercent,
            offsetRightPercent: settings.watermarkOffsetRightPercent,
            offsetBottomPercent: settings.watermarkOffsetBottomPercent,
            offsetLeftPercent: settings.watermarkOffsetLeftPercent,
            minSizePx: settings.watermarkMinSizePx,
            maxSizePx: settings.watermarkMaxSizePx,
        };
    }
    async socialLinks() {
        const settings = await this.prisma.siteSettings.findFirst({
            select: { socialLinks: true },
        });
        return settings?.socialLinks ?? { title: '', links: [] };
    }
    async updateSocialLinks(dto) {
        const existing = await this.prisma.siteSettings.findFirst();
        const data = {
            title: dto.title ?? '',
            links: (dto.links || []).map((link) => ({
                label: link.label,
                href: link.href,
                icon: link.icon || '',
            })),
        };
        if (!existing) {
            return this.prisma.siteSettings.create({
                data: { socialLinks: data },
                select: { socialLinks: true },
            });
        }
        return this.prisma.siteSettings.update({
            where: { id: existing.id },
            data: { socialLinks: data },
            select: { socialLinks: true },
        });
    }
    async updateWatermark(dto) {
        const existing = await this.prisma.siteSettings.findFirst();
        const data = {
            watermarkEnabled: dto.enabled,
            watermarkMediaId: dto.mediaId,
            watermarkOpacity: dto.opacity,
            watermarkSizePercent: dto.sizePercent,
            watermarkPosition: dto.position,
            watermarkOffsetTopPercent: dto.offsetTopPercent,
            watermarkOffsetRightPercent: dto.offsetRightPercent,
            watermarkOffsetBottomPercent: dto.offsetBottomPercent,
            watermarkOffsetLeftPercent: dto.offsetLeftPercent,
            watermarkMinSizePx: dto.minSizePx,
            watermarkMaxSizePx: dto.maxSizePx,
        };
        if (!existing) {
            return this.prisma.siteSettings.create({
                data,
                include: { watermarkMedia: true },
            });
        }
        return this.prisma.siteSettings.update({
            where: { id: existing.id },
            data,
            include: { watermarkMedia: true },
        });
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map