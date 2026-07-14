import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSocialLinksDto } from './dto/update-social-links.dto';
import { UpdateWatermarkDto } from './dto/update-watermark.dto';
import { UpdateSiteHeaderDto } from './dto/update-site-header.dto';

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

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async updateSocialLinks(dto: UpdateSocialLinksDto) {
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
        data: { socialLinks: data as any },
        select: { socialLinks: true },
      });
    }

    return this.prisma.siteSettings.update({
      where: { id: existing.id },
      data: { socialLinks: data as any },
      select: { socialLinks: true },
    });
  }

  async updateWatermark(dto: UpdateWatermarkDto) {
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

  async updateSiteHeader(dto: UpdateSiteHeaderDto) {
    const existing = await this.prisma.siteHeader.findFirst();
    const data: any = {};
    if (dto.lightLogoMediaId !== undefined) {
      data.lightLogoMediaId = dto.lightLogoMediaId || null;
    }
    if (dto.darkLogoMediaId !== undefined) {
      data.darkLogoMediaId = dto.darkLogoMediaId || null;
    }

    if (!existing) {
      return this.prisma.siteHeader.create({
        data,
        include: { lightLogo: true, darkLogo: true },
      });
    }

    return this.prisma.siteHeader.update({
      where: { id: existing.id },
      data,
      include: { lightLogo: true, darkLogo: true },
    });
  }
}
