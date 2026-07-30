import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from './mail.service';
import { SubscribeDto } from './dto/subscribe.dto';

@Injectable()
export class NewsletterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async subscribe(dto: SubscribeDto) {
    const email = dto.email.trim().toLowerCase();
    const token = randomUUID();

    const subscriber = await this.prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email, token, isActive: true },
      update: { token, isActive: true },
    });

    const siteUrl = (
      this.config.get<string>('SITE_URL') ||
      this.config.get<string>('FRONTEND_URL') ||
      ''
    ).replace(/\/+$/, '');
    const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${subscriber.token}`;

    await this.mail.send({
      to: subscriber.email,
      subject: 'Подписка на новости Wine Today',
      text: [
        'Вы подписались на новости Wine Today.',
        '',
        `Если вы не хотите получать наши письма, отпишитесь по ссылке: ${unsubscribeUrl}`,
      ].join('\n'),
      html: [
        '<p>Вы подписались на новости Wine Today.</p>',
        `<p>Если вы не хотите получать наши письма, <a href="${unsubscribeUrl}">отпишитесь по ссылке</a>.</p>`,
      ].join(''),
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
      select: { email: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
