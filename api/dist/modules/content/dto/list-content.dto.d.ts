import { ContentType, ContentStatus } from '@prisma/client';
export declare class ListContentDto {
    type?: ContentType;
    status?: ContentStatus;
    limit: number;
    offset: number;
    categorySlug?: string;
    tagSlug?: string;
    featured?: boolean;
    homepageLead?: boolean;
}
