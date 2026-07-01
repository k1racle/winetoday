import { ContentType } from '@prisma/client';
export declare class IncrementViewDto {
    contentType: ContentType;
    contentId: string;
    viewerId: string;
    slug?: string;
}
