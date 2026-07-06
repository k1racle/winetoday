import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class MediaService {
    private readonly prisma;
    private readonly config;
    private readonly logger;
    private readonly BLOCK_WIDTH_PX;
    private readonly AVIF_QUALITY;
    private readonly AVIF_EFFORT;
    constructor(prisma: PrismaService, config: ConfigService);
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
    createCoverFromUpload(file: Express.Multer.File, applyWatermark?: boolean): Promise<{
        id: string;
        createdAt: Date;
        path: string;
        mime: string | null;
        width: number | null;
        height: number | null;
        altText: string | null;
        sizeBytes: bigint | null;
    }>;
    ensureWatermark(mediaId: string, options?: {
        targetWidth?: number;
    }): Promise<string | null>;
    private applyWatermark;
    private tryCompressToAvif;
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
