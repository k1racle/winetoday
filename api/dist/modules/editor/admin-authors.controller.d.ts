import { EditorService } from './editor.service';
export declare class AdminAuthorsController {
    private readonly editorService;
    constructor(editorService: EditorService);
    listAuthors(): Promise<{
        id: string;
        name: string;
        slug: string;
        position: string;
        materialsCount: number;
        user: {
            id: string;
            email: string;
            username: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }[]>;
    getAuthorAnalytics(id: string): Promise<{
        author: {
            id: string;
            name: string;
            slug: string;
            position: string;
            bio: string;
        };
        materials: {
            id: string;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.ContentType;
            status: import(".prisma/client").$Enums.ContentStatus;
            slug: string;
            title: string;
            publishedAt: Date;
            viewsTotal: number;
        }[];
        totalViews: number;
        dailyViews: {
            date: string;
            articleViews: number;
            newsViews: number;
            videoViews: number;
            galleryViews: number;
            totalViews: number;
        }[];
    }>;
}
