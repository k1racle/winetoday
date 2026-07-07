import { MediaService } from './media.service';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    list(limit?: string, offset?: string): Promise<{
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
    findOne(id: string): Promise<{
        width: number | null;
        id: string;
        path: string;
        mime: string | null;
        height: number | null;
        altText: string | null;
        sizeBytes: bigint | null;
        createdAt: Date;
    }>;
    findOneFile(id: string, res: any): Promise<any>;
    upload(file: Express.Multer.File): Promise<{
        width: number | null;
        id: string;
        path: string;
        mime: string | null;
        height: number | null;
        altText: string | null;
        sizeBytes: bigint | null;
        createdAt: Date;
    }>;
    uploadCover(file: Express.Multer.File, watermark?: string): Promise<{
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
