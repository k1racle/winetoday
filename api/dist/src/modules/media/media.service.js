"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MediaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sharp_1 = __importDefault(require("sharp"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const prisma_service_1 = require("../prisma/prisma.service");
let MediaService = MediaService_1 = class MediaService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.logger = new common_1.Logger(MediaService_1.name);
        this.BLOCK_WIDTH_PX = 1200;
        this.AVIF_QUALITY = 75;
        this.AVIF_EFFORT = 4;
        this.MAX_WIDTH = 1920;
    }
    async createFromUpload(file) {
        const compressed = await this.tryCompressToAvif(file);
        return this.prisma.mediaAsset.create({
            data: {
                path: `/uploads/${path.basename(compressed.path)}`,
                mime: compressed.mime,
                sizeBytes: BigInt(compressed.sizeBytes),
            },
        });
    }
    async createCoverFromUpload(file, applyWatermark = false) {
        const media = await this.createFromUpload(file);
        if (!applyWatermark) {
            return media;
        }
        const watermarkResult = await this.applyWatermark(media.path, { targetWidth: this.BLOCK_WIDTH_PX });
        if (!watermarkResult) {
            return media;
        }
        return this.prisma.mediaAsset.update({
            where: { id: media.id },
            data: { path: watermarkResult },
        });
    }
    async ensureWatermark(mediaId, options) {
        const media = await this.prisma.mediaAsset.findUnique({ where: { id: mediaId } });
        if (!media?.path)
            return null;
        const ext = media.path.match(/\.[^.]+$/)?.[0] || '';
        if (media.path.endsWith(`_wm${ext}`))
            return media.path;
        const watermarkResult = await this.applyWatermark(media.path, {
            targetWidth: options?.targetWidth ?? this.BLOCK_WIDTH_PX,
        });
        if (!watermarkResult)
            return null;
        await this.prisma.mediaAsset.update({
            where: { id: media.id },
            data: { path: watermarkResult },
        });
        return watermarkResult;
    }
    async applyWatermark(sourcePath, options) {
        const watermarkUrl = this.config.get('WATERMARK_SERVICE_URL');
        if (!watermarkUrl) {
            this.logger.warn('WATERMARK_SERVICE_URL is not set, skipping watermark');
            return null;
        }
        const WATERMARK_PATH = '/uploads/56c7826c-a463-4423-a34f-fe59226023f6.png';
        const settings = {
            opacity: 0.85,
            sizePercent: 24,
            position: 'bottom-left',
            offsetTopPercent: 4,
            offsetRightPercent: 4,
            offsetBottomPercent: 8,
            offsetLeftPercent: 4,
            minSizePx: 48,
            maxSizePx: 500,
        };
        try {
            const response = await fetch(`${watermarkUrl}/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourcePath,
                    watermarkPath: WATERMARK_PATH,
                    settings,
                    targetWidth: options?.targetWidth ?? this.BLOCK_WIDTH_PX,
                }),
            });
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Watermark service responded ${response.status}: ${text}`);
            }
            const result = (await response.json());
            return result.path;
        }
        catch (err) {
            this.logger.error('Failed to apply watermark:', err?.message || err);
            return null;
        }
    }
    async tryCompressToAvif(file) {
        const isRasterImage = file.mimetype.startsWith('image/') &&
            !file.mimetype.includes('svg') &&
            !file.mimetype.includes('gif');
        if (!isRasterImage) {
            return { path: file.path, mime: file.mimetype, sizeBytes: file.size };
        }
        try {
            const ext = path.extname(file.path);
            const base = ext ? file.path.slice(0, -ext.length) : file.path;
            const outputPath = `${base}.avif`;
            const transformer = (0, sharp_1.default)(file.path, { animated: false });
            const metadata = await transformer.metadata();
            if (!metadata.width || !metadata.height) {
                return { path: file.path, mime: file.mimetype, sizeBytes: file.size };
            }
            await transformer
                .resize({ width: this.MAX_WIDTH, withoutEnlargement: true })
                .avif({ quality: this.AVIF_QUALITY, effort: this.AVIF_EFFORT })
                .toFile(outputPath);
            const stats = await fs.stat(outputPath);
            await fs.unlink(file.path);
            return { path: outputPath, mime: 'image/avif', sizeBytes: stats.size };
        }
        catch (err) {
            this.logger.warn(`AVIF compression failed for ${file.path}: ${err?.message || err}`);
            return { path: file.path, mime: file.mimetype, sizeBytes: file.size };
        }
    }
    async findAll(limit = 50, offset = 0) {
        const [items, total] = await Promise.all([
            this.prisma.mediaAsset.findMany({
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit,
            }),
            this.prisma.mediaAsset.count(),
        ]);
        return { items, total, limit, offset };
    }
    async findById(id) {
        return this.prisma.mediaAsset.findUnique({ where: { id } });
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = MediaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], MediaService);
//# sourceMappingURL=media.service.js.map