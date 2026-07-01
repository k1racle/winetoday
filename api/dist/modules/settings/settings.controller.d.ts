import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    siteSettings(): Promise<{
        logoMedia: {
            id: string;
            createdAt: Date;
            path: string;
            mime: string | null;
            width: number | null;
            height: number | null;
            altText: string | null;
            sizeBytes: bigint | null;
        };
        watermarkMedia: {
            id: string;
            createdAt: Date;
            path: string;
            mime: string | null;
            width: number | null;
            height: number | null;
            altText: string | null;
            sizeBytes: bigint | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        siteName: string | null;
        siteDescription: string | null;
        logoMediaId: string | null;
        typography: import("@prisma/client/runtime/library").JsonValue | null;
        socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
        watermarkEnabled: boolean;
        watermarkMediaId: string | null;
        watermarkOpacity: number;
        watermarkSizePercent: number;
        watermarkPosition: string;
        watermarkOffsetXPercent: number;
        watermarkOffsetYPercent: number;
        watermarkMinSizePx: number;
        watermarkMaxSizePx: number;
    }>;
    homepage(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string | null;
        description: string | null;
        infographicCards: import("@prisma/client/runtime/library").JsonValue | null;
        blocks: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    siteHeader(): Promise<{
        lightLogo: {
            id: string;
            createdAt: Date;
            path: string;
            mime: string | null;
            width: number | null;
            height: number | null;
            altText: string | null;
            sizeBytes: bigint | null;
        };
        darkLogo: {
            id: string;
            createdAt: Date;
            path: string;
            mime: string | null;
            width: number | null;
            height: number | null;
            altText: string | null;
            sizeBytes: bigint | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        menu: import("@prisma/client/runtime/library").JsonValue | null;
        lightLogoMediaId: string | null;
        darkLogoMediaId: string | null;
        stickyDesktop: boolean;
        stickyTablet: boolean;
        stickyMobile: boolean;
    }>;
    siteFooter(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        columns: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    siteSeo(): Promise<{
        openGraphImage: {
            id: string;
            createdAt: Date;
            path: string;
            mime: string | null;
            width: number | null;
            height: number | null;
            altText: string | null;
            sizeBytes: bigint | null;
        };
        twitterImage: {
            id: string;
            createdAt: Date;
            path: string;
            mime: string | null;
            width: number | null;
            height: number | null;
            altText: string | null;
            sizeBytes: bigint | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        defaultSeo: import("@prisma/client/runtime/library").JsonValue | null;
        openGraphImageMediaId: string | null;
        twitterImageMediaId: string | null;
        robotsEnabled: boolean;
        robotsRules: import("@prisma/client/runtime/library").JsonValue | null;
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
            id: string;
            createdAt: Date;
            path: string;
            mime: string | null;
            width: number | null;
            height: number | null;
            altText: string | null;
            sizeBytes: bigint | null;
        };
        opacity: number;
        sizePercent: number;
        position: string;
        offsetXPercent: number;
        offsetYPercent: number;
        minSizePx: number;
        maxSizePx: number;
    }>;
}
