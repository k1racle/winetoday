import { EditorService } from './editor.service';
import { CreateDraftDto } from './dto/create-draft.dto';
export declare class EditorController {
    private readonly editorService;
    constructor(editorService: EditorService);
    saveDraft(dto: CreateDraftDto, req: any): Promise<{
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
        contentBlocks: import("@prisma/client/runtime/library").JsonValue;
        sources: import("@prisma/client/runtime/library").JsonValue | null;
        tastingNote: import("@prisma/client/runtime/library").JsonValue | null;
        seo: import("@prisma/client/runtime/library").JsonValue | null;
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
    }>;
    getDraft(id: string, req: any): Promise<{
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
        contentBlocks: import("@prisma/client/runtime/library").JsonValue;
        sources: import("@prisma/client/runtime/library").JsonValue | null;
        tastingNote: import("@prisma/client/runtime/library").JsonValue | null;
        seo: import("@prisma/client/runtime/library").JsonValue | null;
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
    }>;
    listMaterials(req: any, type?: string, status?: string, search?: string, authorId?: string, authorName?: string, limit?: string, offset?: string, sort?: string, order?: 'asc' | 'desc'): Promise<{
        items: {
            id: string;
            slug: string;
            updatedAt: Date;
            author: {
                id: string;
                name: string;
            };
            authorId: string;
            type: import(".prisma/client").$Enums.ContentType;
            status: import(".prisma/client").$Enums.ContentStatus;
            coverMedia: {
                path: string;
            };
            title: string;
            publishedAt: Date;
            viewsTotal: number;
        }[];
        total: number;
        counts: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.ContentItemGroupByOutputType, "type"[]> & {
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
}
