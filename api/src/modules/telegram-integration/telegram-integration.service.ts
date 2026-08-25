import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RequestUser } from '../editor/editor.service';
import { ClaimTelegramLinkDto } from './dto/claim-telegram-link.dto';

const EDITOR_ROLES: Role[] = [Role.admin, Role.editor, Role.author];

@Injectable()
export class TelegramIntegrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async createLinkCode(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || !EDITOR_ROLES.includes(user.role)) {
      throw new ForbiddenException('Telegram editor access is not available');
    }

    await this.prisma.telegramLinkToken.deleteMany({ where: { userId } });

    const code = randomBytes(4).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.prisma.telegramLinkToken.create({
      data: { userId, tokenHash: this.hash(code), expiresAt },
    });

    const username = this.config.get<string>('TELEGRAM_BOT_USERNAME')?.replace(/^@/, '');
    return {
      code,
      expiresAt,
      botUrl: username ? `https://t.me/${username}?start=link_${code}` : null,
    };
  }

  async getLinkStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        telegramUserId: true,
        telegramUsername: true,
        telegramLinkedAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return {
      linked: user.telegramUserId !== null,
      telegramUserId: user.telegramUserId?.toString() ?? null,
      telegramUsername: user.telegramUsername,
      telegramLinkedAt: user.telegramLinkedAt,
    };
  }

  async unlink(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        telegramUserId: null,
        telegramUsername: null,
        telegramLinkedAt: null,
      },
    });
    await this.prisma.telegramLinkToken.deleteMany({ where: { userId } });
    return { ok: true };
  }

  async claim(dto: ClaimTelegramLinkDto) {
    const now = new Date();
    const tokenHash = this.hash(dto.code.toUpperCase());
    const telegramUserId = BigInt(dto.telegramUserId);

    await this.prisma.$transaction(async (tx) => {
      const token = await tx.telegramLinkToken.findUnique({
        where: { tokenHash },
        include: { user: { select: { id: true, role: true } } },
      });
      if (!token || token.usedAt || token.expiresAt <= now) {
        throw new BadRequestException('Link code is invalid or expired');
      }
      if (!EDITOR_ROLES.includes(token.user.role)) {
        throw new ForbiddenException('Telegram editor access is not available');
      }

      const claimed = await tx.telegramLinkToken.updateMany({
        where: { id: token.id, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now },
      });
      if (claimed.count !== 1) throw new BadRequestException('Link code is invalid or expired');

      const existing = await tx.user.findUnique({ where: { telegramUserId } });
      if (existing && existing.id !== token.userId) {
        throw new BadRequestException('This Telegram account is already linked');
      }

      await tx.user.update({
        where: { id: token.userId },
        data: {
          telegramUserId,
          telegramUsername: dto.telegramUsername?.replace(/^@/, '') || null,
          telegramLinkedAt: now,
        },
      });
    });

    return { ok: true };
  }

  async resolveEditor(telegramUserId: string | undefined): Promise<RequestUser> {
    if (!telegramUserId || !/^\d{1,20}$/.test(telegramUserId)) {
      throw new BadRequestException('Telegram user id is required');
    }
    const user = await this.prisma.user.findUnique({
      where: { telegramUserId: BigInt(telegramUserId) },
      select: { id: true, email: true, role: true },
    });
    if (!user) throw new ForbiddenException('Telegram account is not linked');
    if (!EDITOR_ROLES.includes(user.role)) {
      throw new ForbiddenException('Telegram editor access is not available');
    }
    return { userId: user.id, email: user.email, role: user.role };
  }

  private hash(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }
}
