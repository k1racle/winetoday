import { ContentType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListContentDto } from './dto/list-content.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
declare const contentInclude: {
    author: true;
    coverMedia: true;
    archiveCoverMedia: true;
    categories: true;
    tags: true;
};
export type ContentItemWithRelations = Prisma.ContentItemGetPayload<{
    include: typeof contentInclude;
}>;
export declare class ContentService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findMany(dto: ListContentDto): Promise<{
        items: ({
            author: {
                id: string;
                createdAt: Date;
                name: string;
                slug: string;
                updatedAt: Date;
                position: string | null;
                bio: string | null;
                memberProfileId: string | null;
            };
            coverMedia: {
                width: number | null;
                id: string;
                path: string;
                mime: string | null;
                height: number | null;
                altText: string | null;
                sizeBytes: bigint | null;
                createdAt: Date;
            };
            archiveCoverMedia: {
                width: number | null;
                id: string;
                path: string;
                mime: string | null;
                height: number | null;
                altText: string | null;
                sizeBytes: bigint | null;
                createdAt: Date;
            };
            categories: {
                id: string;
                createdAt: Date;
                name: string;
                slug: string;
                parentId: string | null;
                updatedAt: Date;
            }[];
            tags: {
                id: string;
                createdAt: Date;
                name: string;
                slug: string;
                updatedAt: Date;
            }[];
        } & {
            id: string;
            createdAt: Date;
            contentBlocks: Prisma.JsonValue;
            sources: Prisma.JsonValue | null;
            tastingNote: Prisma.JsonValue | null;
            seo: Prisma.JsonValue | null;
            slug: string;
            updatedAt: Date;
            authorId: string | null;
            type: import(".prisma/client").$Enums.ContentType;
            status: import(".prisma/client").$Enums.ContentStatus;
            featured: boolean;
            homepageLead: boolean;
            title: string;
            excerpt: string | null;
            publishedAt: Date | null;
            publishedAtCustom: Date | null;
            coverMediaId: string | null;
            archiveCoverMediaId: string | null;
            coverSource: string | null;
            coverShowWatermark: boolean;
            pinned: boolean;
            homepageSpecialBlock: boolean;
            materialLabel: string | null;
            readingTime: number | null;
            preview: boolean;
            videoUrl: string | null;
            duration: number | null;
            viewsTotal: number;
            submittedAt: Date | null;
            reviewedAt: Date | null;
            reviewComment: string | null;
        })[];
        total: number;
        limit: number;
        offset: number;
    }>;
    findBySlug(type: ContentType, slug: string, options?: {
        preview?: boolean;
    }): Promise<ContentItemWithRelations>;
    findCategories(): Promise<{
        id: string;
        name: string;
        slug: string;
        parentId: string;
    }[]>;
    private getCategoryAndDescendantIds;
    private escapeRegex;
    findTags(): Promise<{
        id: string;
        name: string;
        slug: string;
    }[]>;
    findLatestByCategory(limit?: number): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
        };
        items: ({
            author: {
                id: string;
                createdAt: Date;
                name: string;
                slug: string;
                updatedAt: Date;
                position: string | null;
                bio: string | null;
                memberProfileId: string | null;
            };
            coverMedia: {
                width: number | null;
                id: string;
                path: string;
                mime: string | null;
                height: number | null;
                altText: string | null;
                sizeBytes: bigint | null;
                createdAt: Date;
            };
            archiveCoverMedia: {
                width: number | null;
                id: string;
                path: string;
                mime: string | null;
                height: number | null;
                altText: string | null;
                sizeBytes: bigint | null;
                createdAt: Date;
            };
            categories: {
                id: string;
                createdAt: Date;
                name: string;
                slug: string;
                parentId: string | null;
                updatedAt: Date;
            }[];
            tags: {
                id: string;
                createdAt: Date;
                name: string;
                slug: string;
                updatedAt: Date;
            }[];
        } & {
            id: string;
            createdAt: Date;
            contentBlocks: Prisma.JsonValue;
            sources: Prisma.JsonValue | null;
            tastingNote: Prisma.JsonValue | null;
            seo: Prisma.JsonValue | null;
            slug: string;
            updatedAt: Date;
            authorId: string | null;
            type: import(".prisma/client").$Enums.ContentType;
            status: import(".prisma/client").$Enums.ContentStatus;
            featured: boolean;
            homepageLead: boolean;
            title: string;
            excerpt: string | null;
            publishedAt: Date | null;
            publishedAtCustom: Date | null;
            coverMediaId: string | null;
            archiveCoverMediaId: string | null;
            coverSource: string | null;
            coverShowWatermark: boolean;
            pinned: boolean;
            homepageSpecialBlock: boolean;
            materialLabel: string | null;
            readingTime: number | null;
            preview: boolean;
            videoUrl: string | null;
            duration: number | null;
            viewsTotal: number;
            submittedAt: Date | null;
            reviewedAt: Date | null;
            reviewComment: string | null;
        })[];
    }[]>;
    findHomepageContent(): Promise<{
        lead: ({
            author: {
                id: string;
                createdAt: Date;
                name: string;
                slug: string;
                updatedAt: Date;
                position: string | null;
                bio: string | null;
                memberProfileId: string | null;
            };
            coverMedia: {
                width: number | null;
                id: string;
                path: string;
                mime: string | null;
                height: number | null;
                altText: string | null;
                sizeBytes: bigint | null;
                createdAt: Date;
            };
            archiveCoverMedia: {
                width: number | null;
                id: string;
                path: string;
                mime: string | null;
                height: number | null;
                altText: string | null;
                sizeBytes: bigint | null;
                createdAt: Date;
            };
            categories: {
                id: string;
                createdAt: Date;
                name: string;
                slug: string;
                parentId: string | null;
                updatedAt: Date;
            }[];
            tags: {
                id: string;
                createdAt: Date;
                name: string;
                slug: string;
                updatedAt: Date;
            }[];
        } & {
            id: string;
            createdAt: Date;
            contentBlocks: Prisma.JsonValue;
            sources: Prisma.JsonValue | null;
            tastingNote: Prisma.JsonValue | null;
            seo: Prisma.JsonValue | null;
            slug: string;
            updatedAt: Date;
            authorId: string | null;
            type: import(".prisma/client").$Enums.ContentType;
            status: import(".prisma/client").$Enums.ContentStatus;
            featured: boolean;
            homepageLead: boolean;
            title: string;
            excerpt: string | null;
            publishedAt: Date | null;
            publishedAtCustom: Date | null;
            coverMediaId: string | null;
            archiveCoverMediaId: string | null;
            coverSource: string | null;
            coverShowWatermark: boolean;
            pinned: boolean;
            homepageSpecialBlock: boolean;
            materialLabel: string | null;
            readingTime: number | null;
            preview: boolean;
            videoUrl: string | null;
            duration: number | null;
            viewsTotal: number;
            submittedAt: Date | null;
            reviewedAt: Date | null;
            reviewComment: string | null;
        })[];
        articles: ({
            author: {
                id: string;
                createdAt: Date;
                name: string;
                slug: string;
                updatedAt: Date;
                position: string | null;
                bio: string | null;
                memberProfileId: string | null;
            };
            coverMedia: {
                width: number | null;
                id: string;
                path: string;
                mime: string | null;
                height: number | null;
                altText: string | null;
                sizeBytes: bigint | null;
                createdAt: Date;
            };
            archiveCoverMedia: {
                width: number | null;
                id: string;
                path: string;
                mime: string | null;
                height: number | null;
                altText: string | null;
                sizeBytes: bigint | null;
                createdAt: Date;
            };
            categories: {
                id: string;
                createdAt: Date;
                name: string;
                slug: string;
                parentId: string | null;
                updatedAt: Date;
            }[];
            tags: {
                id: string;
                createdAt: Date;
                name: string;
                slug: string;
                updatedAt: Date;
            }[];
        } & {
            id: string;
            createdAt: Date;
            contentBlocks: Prisma.JsonValue;
            sources: Prisma.JsonValue | null;
            tastingNote: Prisma.JsonValue | null;
            seo: Prisma.JsonValue | null;
            slug: string;
            updatedAt: Date;
            authorId: string | null;
            type: import(".prisma/client").$Enums.ContentType;
            status: import(".prisma/client").$Enums.ContentStatus;
            featured: boolean;
            homepageLead: boolean;
            title: string;
            excerpt: string | null;
            publishedAt: Date | null;
            publishedAtCustom: Date | null;
            coverMediaId: string | null;
            archiveCoverMediaId: string | null;
            coverSource: string | null;
            coverShowWatermark: boolean;
            pinned: boolean;
            homepageSpecialBlock: boolean;
            materialLabel: string | null;
            readingTime: number | null;
            preview: boolean;
            videoUrl: string | null;
            duration: number | null;
            viewsTotal: number;
            submittedAt: Date | null;
            reviewedAt: Date | null;
            reviewComment: string | null;
        })[];
        news: ({
            author: {
                id: string;
                createdAt: Date;
                name: string;
                slug: string;
                updatedAt: Date;
                position: string | null;
                bio: string | null;
                memberProfileId: string | null;
            };
            coverMedia: {
                width: number | null;
                id: string;
                path: string;
                mime: string | null;
                height: number | null;
                altText: string | null;
                sizeBytes: bigint | null;
                createdAt: Date;
            };
            archiveCoverMedia: {
                width: number | null;
                id: string;
                path: string;
                mime: string | null;
                height: number | null;
                altText: string | null;
                sizeBytes: bigint | null;
                createdAt: Date;
            };
            categories: {
                id: string;
                createdAt: Date;
                name: string;
                slug: string;
                parentId: string | null;
                updatedAt: Date;
            }[];
            tags: {
                id: string;
                createdAt: Date;
                name: string;
                slug: string;
                updatedAt: Date;
            }[];
        } & {
            id: string;
            createdAt: Date;
            contentBlocks: Prisma.JsonValue;
            sources: Prisma.JsonValue | null;
            tastingNote: Prisma.JsonValue | null;
            seo: Prisma.JsonValue | null;
            slug: string;
            updatedAt: Date;
            authorId: string | null;
            type: import(".prisma/client").$Enums.ContentType;
            status: import(".prisma/client").$Enums.ContentStatus;
            featured: boolean;
            homepageLead: boolean;
            title: string;
            excerpt: string | null;
            publishedAt: Date | null;
            publishedAtCustom: Date | null;
            coverMediaId: string | null;
            archiveCoverMediaId: string | null;
            coverSource: string | null;
            coverShowWatermark: boolean;
            pinned: boolean;
            homepageSpecialBlock: boolean;
            materialLabel: string | null;
            readingTime: number | null;
            preview: boolean;
            videoUrl: string | null;
            duration: number | null;
            viewsTotal: number;
            submittedAt: Date | null;
            reviewedAt: Date | null;
            reviewComment: string | null;
        })[];
        videos: ({
            author: {
                id: string;
                createdAt: Date;
                name: string;
                slug: string;
                updatedAt: Date;
                position: string | null;
                bio: string | null;
                memberProfileId: string | null;
            };
            coverMedia: {
                width: number | null;
                id: string;
                path: string;
                mime: string | null;
                height: number | null;
                altText: string | null;
                sizeBytes: bigint | null;
                createdAt: Date;
            };
            archiveCoverMedia: {
                width: number | null;
                id: string;
                path: string;
                mime: string | null;
                height: number | null;
                altText: string | null;
                sizeBytes: bigint | null;
                createdAt: Date;
            };
            categories: {
                id: string;
                createdAt: Date;
                name: string;
                slug: string;
                parentId: string | null;
                updatedAt: Date;
            }[];
            tags: {
                id: string;
                createdAt: Date;
                name: string;
                slug: string;
                updatedAt: Date;
            }[];
        } & {
            id: string;
            createdAt: Date;
            contentBlocks: Prisma.JsonValue;
            sources: Prisma.JsonValue | null;
            tastingNote: Prisma.JsonValue | null;
            seo: Prisma.JsonValue | null;
            slug: string;
            updatedAt: Date;
            authorId: string | null;
            type: import(".prisma/client").$Enums.ContentType;
            status: import(".prisma/client").$Enums.ContentStatus;
            featured: boolean;
            homepageLead: boolean;
            title: string;
            excerpt: string | null;
            publishedAt: Date | null;
            publishedAtCustom: Date | null;
            coverMediaId: string | null;
            archiveCoverMediaId: string | null;
            coverSource: string | null;
            coverShowWatermark: boolean;
            pinned: boolean;
            homepageSpecialBlock: boolean;
            materialLabel: string | null;
            readingTime: number | null;
            preview: boolean;
            videoUrl: string | null;
            duration: number | null;
            viewsTotal: number;
            submittedAt: Date | null;
            reviewedAt: Date | null;
            reviewComment: string | null;
        })[];
        galleries: ({
            author: {
                id: string;
                createdAt: Date;
                name: string;
                slug: string;
                updatedAt: Date;
                position: string | null;
                bio: string | null;
                memberProfileId: string | null;
            };
            coverMedia: {
                width: number | null;
                id: string;
                path: string;
                mime: string | null;
                height: number | null;
                altText: string | null;
                sizeBytes: bigint | null;
                createdAt: Date;
            };
            archiveCoverMedia: {
                width: number | null;
                id: string;
                path: string;
                mime: string | null;
                height: number | null;
                altText: string | null;
                sizeBytes: bigint | null;
                createdAt: Date;
            };
            categories: {
                id: string;
                createdAt: Date;
                name: string;
                slug: string;
                parentId: string | null;
                updatedAt: Date;
            }[];
            tags: {
                id: string;
                createdAt: Date;
                name: string;
                slug: string;
                updatedAt: Date;
            }[];
        } & {
            id: string;
            createdAt: Date;
            contentBlocks: Prisma.JsonValue;
            sources: Prisma.JsonValue | null;
            tastingNote: Prisma.JsonValue | null;
            seo: Prisma.JsonValue | null;
            slug: string;
            updatedAt: Date;
            authorId: string | null;
            type: import(".prisma/client").$Enums.ContentType;
            status: import(".prisma/client").$Enums.ContentStatus;
            featured: boolean;
            homepageLead: boolean;
            title: string;
            excerpt: string | null;
            publishedAt: Date | null;
            publishedAtCustom: Date | null;
            coverMediaId: string | null;
            archiveCoverMediaId: string | null;
            coverSource: string | null;
            coverShowWatermark: boolean;
            pinned: boolean;
            homepageSpecialBlock: boolean;
            materialLabel: string | null;
            readingTime: number | null;
            preview: boolean;
            videoUrl: string | null;
            duration: number | null;
            viewsTotal: number;
            submittedAt: Date | null;
            reviewedAt: Date | null;
            reviewComment: string | null;
        })[];
    }>;
    createCategory(dto: CreateCategoryDto): Promise<{
        id: string;
        name: string;
        slug: string;
        parentId: string;
    }>;
    updateCategory(id: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        name: string;
        slug: string;
        parentId: string;
    }>;
    deleteCategory(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        slug: string;
        parentId: string | null;
        updatedAt: Date;
    }>;
    private findCategoryOrThrow;
    createTag(dto: CreateTagDto): Promise<{
        id: string;
        name: string;
        slug: string;
    }>;
    updateTag(id: string, dto: UpdateTagDto): Promise<{
        id: string;
        name: string;
        slug: string;
    }>;
    deleteTag(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        slug: string;
        updatedAt: Date;
    }>;
    private findTagOrThrow;
}
export {};
