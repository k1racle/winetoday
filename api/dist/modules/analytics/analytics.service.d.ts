import { PrismaService } from '../prisma/prisma.service';
import { IncrementViewDto } from './dto/increment-view.dto';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    private viewsField;
}
