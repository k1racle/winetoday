import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    siteSettings(): Promise<{
        logoMedia: {
            width: number | null;
            id: string;
            path: string;
            mime: string | null;
            height: number | null;
            altText: string | null;
            sizeBytes: bigint | null;
            createdAt: Date;
        };
        watermarkMedia: {
            width: number | null;
            id: string;
            path: string;
            mime: string | null;
            height: number | null;
            altText: string | null;
            sizeBytes: bigint | null;
            createdAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        typography: import("@prisma/client/runtime/library").JsonValue | null;
        socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
        updatedAt: Date;
        siteName: string | null;
        siteDescription: string | null;
        logoMediaId: string | null;
        watermarkEnabled: boolean;
        watermarkMediaId: string | null;
        watermarkOpacity: number;
        watermarkSizePercent: number;
        watermarkPosition: string;
        watermarkOffsetTopPercent: number;
        watermarkOffsetRightPercent: number;
        watermarkOffsetBottomPercent: number;
        watermarkOffsetLeftPercent: number;
        watermarkMinSizePx: number;
        watermarkMaxSizePx: number;
    }>;
    homepage(): Promise<{
        id: string;
        createdAt: Date;
        infographicCards: import("@prisma/client/runtime/library").JsonValue | null;
        blocks: import("@prisma/client/runtime/library").JsonValue | null;
        updatedAt: Date;
        title: string | null;
        description: string | null;
    }>;
    siteHeader(): Promise<{
        lightLogo: {
            width: number | null;
            id: string;
            path: string;
            mime: string | null;
            height: number | null;
            altText: string | null;
            sizeBytes: bigint | null;
            createdAt: Date;
        };
        darkLogo: {
            width: number | null;
            id: string;
            path: string;
            mime: string | null;
            height: number | null;
            altText: string | null;
            sizeBytes: bigint | null;
            createdAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        menu: import("@prisma/client/runtime/library").JsonValue | null;
        updatedAt: Date;
        lightLogoMediaId: string | null;
        darkLogoMediaId: string | null;
        stickyDesktop: boolean;
        stickyTablet: boolean;
        stickyMobile: boolean;
    }>;
    siteFooter(): Promise<{
        id: string;
        createdAt: Date;
        columns: import("@prisma/client/runtime/library").JsonValue | null;
        updatedAt: Date;
    }>;
    siteSeo(): Promise<{
        openGraphImage: {
            width: number | null;
            id: string;
            path: string;
            mime: string | null;
            height: number | null;
            altText: string | null;
            sizeBytes: bigint | null;
            createdAt: Date;
        };
        twitterImage: {
            width: number | null;
            id: string;
            path: string;
            mime: string | null;
            height: number | null;
            altText: string | null;
            sizeBytes: bigint | null;
            createdAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        defaultSeo: import("@prisma/client/runtime/library").JsonValue | null;
        robotsRules: import("@prisma/client/runtime/library").JsonValue | null;
        updatedAt: Date;
        openGraphImageMediaId: string | null;
        twitterImageMediaId: string | null;
        robotsEnabled: boolean;
        robotsHost: string | null;
        robotsAdditionalSitemaps: string | null;
        sitemapEnabled: boolean;
        sitemapExcludePaths: string | null;
        sitemapIncludeArticles: boolean;
        sitemapIncludeNews: boolean;
        sitemapIncludeVideos: boolean;
        sitemapIncludePages: boolean;
        sitemapIncludeGalleries: boolean;
    }>;
    watermark(): Promise<{
        enabled: boolean;
        mediaId: string;
        media: {
            width: number | null;
            id: string;
            path: string;
            mime: string | null;
            height: number | null;
            altText: string | null;
            sizeBytes: bigint | null;
            createdAt: Date;
        };
        opacity: number;
        sizePercent: number;
        position: string;
        offsetTopPercent: number;
        offsetRightPercent: number;
        offsetBottomPercent: number;
        offsetLeftPercent: number;
        minSizePx: number;
        maxSizePx: number;
    }>;
}
