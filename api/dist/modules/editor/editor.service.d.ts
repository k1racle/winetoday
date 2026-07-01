import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDraftDto } from './dto/create-draft.dto';
export type RequestUser = {
    userId: string;
    email: string;
    role: Role;
};
export declare class EditorService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    saveDraft(user: RequestUser, dto: CreateDraftDto): Promise<{
        author: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            position: string | null;
            bio: string | null;
            memberProfileId: string | null;
        };
        coverMedia: {
            id: string;
            createdAt: Date;
            path: string;
            mime: string | null;
            width: number | null;
            height: number | null;
            altText: string | null;
            sizeBytes: bigint | null;
        };
        categories: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            parentId: string | null;
        }[];
        tags: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        authorId: string | null;
        type: import(".prisma/client").$Enums.ContentType;
        status: import(".prisma/client").$Enums.ContentStatus;
        featured: boolean;
        homepageLead: boolean;
        slug: string;
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
        contentBlocks: Prisma.JsonValue;
        sources: Prisma.JsonValue | null;
        tastingNote: Prisma.JsonValue | null;
        videoUrl: string | null;
        seo: Prisma.JsonValue | null;
        viewsTotal: number;
        submittedAt: Date | null;
        reviewedAt: Date | null;
        reviewComment: string | null;
    }>;
    findDraft(user: RequestUser, id: string): Promise<{
        author: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            position: string | null;
            bio: string | null;
            memberProfileId: string | null;
        };
        coverMedia: {
            id: string;
            createdAt: Date;
            path: string;
            mime: string | null;
            width: number | null;
            height: number | null;
            altText: string | null;
            sizeBytes: bigint | null;
        };
        categories: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            parentId: string | null;
        }[];
        tags: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        authorId: string | null;
        type: import(".prisma/client").$Enums.ContentType;
        status: import(".prisma/client").$Enums.ContentStatus;
        featured: boolean;
        homepageLead: boolean;
        slug: string;
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
        contentBlocks: Prisma.JsonValue;
        sources: Prisma.JsonValue | null;
        tastingNote: Prisma.JsonValue | null;
        videoUrl: string | null;
        seo: Prisma.JsonValue | null;
        viewsTotal: number;
        submittedAt: Date | null;
        reviewedAt: Date | null;
        reviewComment: string | null;
    }>;
    listMaterials(user: RequestUser, options?: {
        type?: string;
        status?: string;
        search?: string;
        authorId?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        items: {
            author: {
                name: string;
            };
            id: string;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.ContentType;
            status: import(".prisma/client").$Enums.ContentStatus;
            slug: string;
            coverMedia: {
                path: string;
            };
            title: string;
            publishedAt: Date;
            viewsTotal: number;
        }[];
        total: number;
        counts: (Prisma.PickEnumerable<Prisma.ContentItemGroupByOutputType, "type"[]> & {
            _count: {
                type: number;
            };
        })[];
    }>;
    listAuthors(): Promise<{
        id: string;
        name: string;
        slug: string;
    }[]>;
    private ensureAuthorId;
    private ensureUniqueSlug;
    private canEdit;
}
