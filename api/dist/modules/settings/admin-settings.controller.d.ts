import { SettingsService } from './settings.service';
import { UpdateSocialLinksDto } from './dto/update-social-links.dto';
export declare class AdminSettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    socialLinks(): Promise<import("@prisma/client/runtime/library").JsonValue>;
    updateSocialLinks(dto: UpdateSocialLinksDto): Promise<{
        socialLinks: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
