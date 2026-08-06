import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type WinemakersCommentTargetType = 'person' | 'wine';

@Injectable()
export class WinemakersEngagementService {
  constructor(private readonly prisma: PrismaService) {}

  async getComments(targetType: WinemakersCommentTargetType, targetId: string) {
    await this.ensurePublicTarget(targetType, targetId);

    const comments = await this.prisma.comment.findMany({
      where: {
        ...(targetType === 'person' ? { personId: targetId } : { wineId: targetId }),
        status: 'approved',
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            memberProfile: { select: { displayName: true } },
          },
        },
      },
    });

    return comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      author: comment.user?.memberProfile?.displayName || comment.user?.username || 'Аноним',
      userId: comment.userId,
    }));
  }

  async createComment(
    targetType: WinemakersCommentTargetType,
    targetId: string,
    userId: string,
    body: string,
  ) {
    await this.ensurePublicTarget(targetType, targetId);
    await this.assertNoStopWords(body);

    const comment = await this.prisma.comment.create({
      data: {
        ...(targetType === 'person' ? { personId: targetId } : { wineId: targetId }),
        userId,
        body: body.trim(),
        status: 'approved',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            memberProfile: { select: { displayName: true } },
          },
        },
      },
    });

    return {
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      status: comment.status,
      author: comment.user?.memberProfile?.displayName || comment.user?.username || 'Аноним',
    };
  }

  async deleteComment(
    targetType: WinemakersCommentTargetType,
    targetId: string,
    commentId: string,
    userId: string,
  ) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true, personId: true, wineId: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const matchesTarget =
      (targetType === 'person' && comment.personId === targetId) ||
      (targetType === 'wine' && comment.wineId === targetId);

    if (!matchesTarget) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (!user || !['admin', 'editor'].includes(user.role)) {
        throw new ForbiddenException('Not allowed to delete this comment');
      }
    }

    await this.prisma.comment.delete({ where: { id: commentId } });
    return this.getComments(targetType, targetId);
  }

  private async ensurePublicTarget(targetType: WinemakersCommentTargetType, targetId: string) {
    const target =
      targetType === 'person'
        ? await this.prisma.person.findUnique({
            where: { id: targetId },
            select: { id: true, status: true },
          })
        : await this.prisma.wine.findUnique({
            where: { id: targetId },
            select: { id: true, status: true },
          });

    if (!target || target.status !== ContentStatus.published) {
      throw new NotFoundException('Target not found');
    }
  }

  private async assertNoStopWords(body: string) {
    const stopWords = await this.prisma.commentStopWord.findMany({
      select: { word: true },
    });
    if (!stopWords.length) return;

    const text = body.toLowerCase();
    const hit = stopWords.some(({ word }) => {
      const escaped = this.escapeRegex(word.toLowerCase());
      return new RegExp(`(^|[^a-zа-яё0-9])${escaped}`, 'iu').test(text);
    });

    if (hit) {
      throw new BadRequestException('Комментарий содержит запрещённые слова');
    }
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
