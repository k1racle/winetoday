import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async createFromUpload(file: Express.Multer.File) {
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

  async findById(id: string) {
    return this.prisma.mediaAsset.findUnique({ where: { id } });
  }
}
