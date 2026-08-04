import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

@Injectable()
export class CommunityService {
  constructor(private readonly prisma: PrismaService) {}

  async listComments(query: { limit?: string; offset?: string }) {
    const limit = Math.min(Math.max(parseInt(query.limit || '', 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
    const offset = Math.max(parseInt(query.offset || '', 10) || 0, 0);

    const where = {};
    const [items, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          contentItem: {
            select: { id: true, title: true, slug: true, type: true },
          },
          user: {
            select: {
              username: true,
              email: true,
              memberProfile: { select: { displayName: true } },
            },
          },
        },
      }),
      this.prisma.comment.count({ where }),
    ]);

    return {
      items: items.map((c) => ({
        id: c.id,
        body: c.body,
        status: c.status,
        createdAt: c.createdAt,
        contentItem: c.contentItem,
        author:
          c.user?.memberProfile?.displayName ||
          c.user?.username ||
          c.user?.email ||
          'Аноним',
      })),
      total,
      limit,
      offset,
    };
  }

  async deleteComment(id: string) {
    const existing = await this.prisma.comment.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Comment not found');
    }
    await this.prisma.comment.delete({ where: { id } });
    return { success: true };
  }

  listStopWords() {
    return this.prisma.commentStopWord.findMany({
      orderBy: { word: 'asc' },
      select: { id: true, word: true },
    });
  }

  async addStopWord(word: string) {
    const normalized = word.trim().toLowerCase();
    if (!normalized) {
      throw new BadRequestException('Пустое слово');
    }
    return this.prisma.commentStopWord.upsert({
      where: { word: normalized },
      create: { word: normalized },
      update: {},
      select: { id: true, word: true },
    });
  }

  async deleteStopWord(id: string) {
    const existing = await this.prisma.commentStopWord.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Stop word not found');
    }
    await this.prisma.commentStopWord.delete({ where: { id } });
    return { success: true };
  }
}
