import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

export interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    this.from = this.config.get<string>('SMTP_FROM') || 'noreply@localhost';

    if (!host) {
      this.transporter = null;
      this.logger.warn(
        'SMTP_HOST is not set — outgoing emails will be logged to console instead of being sent',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: Number(this.config.get<string>('SMTP_PORT') || 587),
      secure: Number(this.config.get<string>('SMTP_PORT') || 587) === 465,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });
  }

  async send(options: SendMailOptions): Promise<void> {
    if (!this.transporter) {
      this.logger.log(
        `[mail skipped] to=${options.to} subject="${options.subject}"\n${options.text}`,
      );
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }
}
