import { SettingsService } from './settings.service';
import { UpdateSocialLinksDto } from './dto/update-social-links.dto';
import { UpdateWatermarkDto } from './dto/update-watermark.dto';
export declare class AdminSettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    socialLinks(): Promise<import("@prisma/client/runtime/library").JsonValue>;
    updateSocialLinks(dto: UpdateSocialLinksDto): Promise<{
        socialLinks: import("@prisma/client/runtime/library").JsonValue;
    }>;
    updateWatermark(dto: UpdateWatermarkDto): Promise<{
        watermarkMedia: {
            id: string;
            path: string;
            mime: string | null;
            width: number | null;
            height: number | null;
            altText: string | null;
            sizeBytes: bigint | null;
            createdAt: Date;
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
        watermarkOffsetTopPercent: number;
        watermarkOffsetRightPercent: number;
        watermarkOffsetBottomPercent: number;
        watermarkOffsetLeftPercent: number;
        watermarkMinSizePx: number;
        watermarkMaxSizePx: number;
    }>;
}
