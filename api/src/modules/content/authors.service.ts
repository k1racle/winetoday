import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const contentInclude = {
  author: { include: { avatarMedia: true } },
  coverMedia: true,
  archiveCoverMedia: true,
  categories: true,
  tags: true,
} satisfies Prisma.ContentItemInclude;

@Injectable()
export class AuthorsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveAuthorId(slug: string): Promise<string> {
    const author = await this.prisma.author.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!author) {
      throw new NotFoundException('Author not found');
    }
    return author.id;
  }

  async findAuthorBySlug(slug: string, userId?: string) {
    const author = await this.prisma.author.findUnique({
      where: { slug },
      include: { avatarMedia: true },
    });

    if (!author) {
      throw new NotFoundException('Author not found');
    }

    const [subscriberCount, subscription] = await Promise.all([
      this.prisma.authorSubscription.count({ where: { authorId: author.id } }),
      userId
        ? this.prisma.authorSubscription.findUnique({
            where: {
              userId_authorId: {
                userId,
                authorId: author.id,
              },
            },
          })
        : null,
    ]);

    return {
      ...author,
      subscriberCount,
      isSubscribed: !!subscription,
    };
  }

  async findAuthorContentBySlug(slug: string) {
    const authorId = await this.resolveAuthorId(slug);

    const items = await this.prisma.contentItem.findMany({
      where: {
        authorId,
        status: ContentStatus.published,
        publishedAt: { lte: new Date() },
      },
      include: contentInclude,
      orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return { items };
  }

  async subscribe(slug: string, userId: string) {
    const authorId = await this.resolveAuthorId(slug);

    await this.prisma.authorSubscription.upsert({
      where: {
        userId_authorId: {
          userId,
          authorId,
        },
      },
      update: {},
      create: { userId, authorId },
    });

    return { subscribed: true };
  }

  async unsubscribe(slug: string, userId: string) {
    const authorId = await this.resolveAuthorId(slug);

    await this.prisma.authorSubscription.deleteMany({
      where: { userId, authorId },
    });

    return { subscribed: false };
  }

  async getSubscription(slug: string, userId?: string) {
    const authorId = await this.resolveAuthorId(slug);

    const [count, subscription] = await Promise.all([
      this.prisma.authorSubscription.count({ where: { authorId } }),
      userId
        ? this.prisma.authorSubscription.findUnique({
            where: {
              userId_authorId: {
                userId,
                authorId,
              },
            },
          })
        : null,
    ]);

    return { subscribed: !!subscription, count };
  }
}
