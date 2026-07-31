import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from './mail.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { UpdatePreferencesDto } from './dto/preferences.dto';

@Injectable()
export class NewsletterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  private siteUrl(): string {
    return (
      this.config.get<string>('SITE_URL') ||
      this.config.get<string>('FRONTEND_URL') ||
      ''
    ).replace(/\/+$/, '');
  }

  async subscribe(dto: SubscribeDto) {
    const email = dto.email.trim().toLowerCase();
    const topics = dto.topics?.map((t) => t.trim()).filter(Boolean);

    const subscriber = await this.prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email, token: randomUUID(), isActive: true, topics: topics ?? [] },
      // При повторной подписке токен и confirmedAt сохраняем
      update: { isActive: true, ...(topics ? { topics } : {}) },
    });

    const siteUrl = this.siteUrl();
    const confirmUrl = `${siteUrl}/newsletter/confirm?token=${subscriber.token}`;
    const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${subscriber.token}`;

    await this.mail.send({
      to: subscriber.email,
      subject: 'Подтвердите подписку на новости Wine Today',
      text: [
        'Вы подписались на новости Wine Today.',
        '',
        `Подтвердите подписку по ссылке: ${confirmUrl}`,
        '',
        `Если вы не хотите получать наши письма, отпишитесь по ссылке: ${unsubscribeUrl}`,
      ].join('\n'),
      html: [
        '<p>Вы подписались на новости Wine Today.</p>',
        `<p><a href="${confirmUrl}">Подтвердите подписку по ссылке</a>.</p>`,
        `<p>Если вы не хотите получать наши письма, <a href="${unsubscribeUrl}">отпишитесь по ссылке</a>.</p>`,
      ].join(''),
    });

    return { ok: true };
  }

  async confirm(token: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { token },
    });

    if (!subscriber) {
      throw new NotFoundException('Подписка не найдена');
    }

    await this.prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { confirmedAt: new Date() },
    });

    return { ok: true };
  }

  async getPreferences(token: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { token },
    });

    if (!subscriber) {
      throw new NotFoundException('Подписка не найдена');
    }

    return {
      email: subscriber.email,
      topics: subscriber.topics,
      isActive: subscriber.isActive,
      confirmed: Boolean(subscriber.confirmedAt),
    };
  }

  async updatePreferences(dto: UpdatePreferencesDto) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { token: dto.token },
    });

    if (!subscriber) {
      throw new NotFoundException('Подписка не найдена');
    }

    await this.prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { topics: dto.topics, isActive: dto.isActive },
    });

    return { ok: true };
  }

  async unsubscribe(token: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { token },
    });

    if (!subscriber) {
      throw new NotFoundException('Подписка не найдена');
    }

    await this.prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { isActive: false },
    });

    return { ok: true };
  }

  async activeSubscribers() {
    return this.prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { id: true, email: true, topics: true, confirmedAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
