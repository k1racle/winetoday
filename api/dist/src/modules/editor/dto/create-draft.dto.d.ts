import { ContentType, ContentStatus } from '@prisma/client';
export declare class CreateDraftDto {
    id?: string;
    type: ContentType;
    title: string;
    slug?: string;
    excerpt?: string;
    status?: ContentStatus;
    publishedAt?: string;
    materialLabel?: string;
    featured?: boolean;
    homepageSpecialBlock?: boolean;
    coverMediaId?: string;
    coverShowWatermark?: boolean;
    videoUrl?: string;
    duration?: number;
    authorId?: string;
    categoryIds?: string[];
    tagIds?: string[];
    contentBlocks?: any;
    sources?: any;
    seo?: any;
}
