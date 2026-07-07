import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class MediaService {
    private readonly prisma;
    private readonly config;
    private readonly logger;
    private readonly BLOCK_WIDTH_PX;
    private readonly AVIF_QUALITY;
    private readonly AVIF_EFFORT;
    private readonly MAX_WIDTH;
    constructor(prisma: PrismaService, config: ConfigService);
    createFromUpload(file: Express.Multer.File): Promise<{
        width: number | null;
        id: string;
        path: string;
        mime: string | null;
        height: number | null;
        altText: string | null;
        sizeBytes: bigint | null;
        createdAt: Date;
    }>;
    createCoverFromUpload(file: Express.Multer.File, applyWatermark?: boolean): Promise<{
        width: number | null;
        id: string;
        path: string;
        mime: string | null;
        height: number | null;
        altText: string | null;
        sizeBytes: bigint | null;
        createdAt: Date;
    }>;
    ensureWatermark(mediaId: string, options?: {
        targetWidth?: number;
    }): Promise<string | null>;
    private applyWatermark;
    private tryCompressToAvif;
    findAll(limit?: number, offset?: number): Promise<{
        items: {
            width: number | null;
            id: string;
            path: string;
            mime: string | null;
            height: number | null;
            altText: string | null;
            sizeBytes: bigint | null;
            createdAt: Date;
        }[];
        total: number;
        limit: number;
        offset: number;
    }>;
    findById(id: string): Promise<{
        width: number | null;
        id: string;
        path: string;
        mime: string | null;
        height: number | null;
        altText: string | null;
        sizeBytes: bigint | null;
        createdAt: Date;
    }>;
}
