import { Module } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { NewsletterController } from './newsletter.controller';
import { AdminNewsletterController } from './admin-newsletter.controller';
import { MailService } from './mail.service';

@Module({
  controllers: [NewsletterController, AdminNewsletterController],
  providers: [NewsletterService, MailService],
  exports: [NewsletterService, MailService],
})
export class NewsletterModule {}
