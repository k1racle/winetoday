"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MediaService = class MediaService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createFromUpload(file) {
        return this.prisma.mediaAsset.create({
            data: {
                path: `/uploads/${file.filename}`,
                mime: file.mimetype,
                sizeBytes: BigInt(file.size),
            },
        });
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
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MediaService);
//# sourceMappingURL=media.service.js.map