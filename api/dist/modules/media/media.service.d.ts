import { PrismaService } from '../prisma/prisma.service';
export declare class MediaService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createFromUpload(file: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        path: string;
        mime: string | null;
        width: number | null;
        height: number | null;
        altText: string | null;
        sizeBytes: bigint | null;
    }>;
    findAll(limit?: number, offset?: number): Promise<{
        items: {
            id: string;
            createdAt: Date;
            path: string;
            mime: string | null;
            width: number | null;
            height: number | null;
            altText: string | null;
            sizeBytes: bigint | null;
        }[];
        total: number;
        limit: number;
        offset: number;
    }>;
    findById(id: string): Promise<{
        id: string;
        createdAt: Date;
        path: string;
        mime: string | null;
        width: number | null;
        height: number | null;
        altText: string | null;
        sizeBytes: bigint | null;
    }>;
}
