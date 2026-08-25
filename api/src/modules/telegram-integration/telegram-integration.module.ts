import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ContentModule } from '../content/content.module';
import { EditorModule } from '../editor/editor.module';
import { MediaModule } from '../media/media.module';
import { IntegrationTokenGuard } from './integration-token.guard';
import { TelegramEditorController } from './telegram-editor.controller';
import { TelegramLinkController } from './telegram-link.controller';
import { TelegramIntegrationService } from './telegram-integration.service';

@Module({
  imports: [AuthModule, ContentModule, EditorModule, MediaModule],
  controllers: [TelegramEditorController, TelegramLinkController],
  providers: [TelegramIntegrationService, IntegrationTokenGuard],
})
export class TelegramIntegrationModule {}
