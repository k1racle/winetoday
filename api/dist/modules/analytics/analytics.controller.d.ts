import { AnalyticsService } from './analytics.service';
import { IncrementViewDto } from './dto/increment-view.dto';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    increment(dto: IncrementViewDto): Promise<{
        counted: boolean;
        views: number;
    }>;
    summary(contentType: string, contentId: string): Promise<{
        contentType: string;
        contentId: string;
        views: number;
        uniqueViewers: number;
    }>;
}
