import { MediaService } from './media.service';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    list(limit?: string, offset?: string): Promise<{
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
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        path: string;
        mime: string | null;
        width: number | null;
        height: number | null;
        altText: string | null;
        sizeBytes: bigint | null;
    }>;
    findOneFile(id: string, res: any): Promise<any>;
    upload(file: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        path: string;
        mime: string | null;
        width: number | null;
        height: number | null;
        altText: string | null;
        sizeBytes: bigint | null;
    }>;
    uploadCover(file: Express.Multer.File, watermark?: string): Promise<{
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
