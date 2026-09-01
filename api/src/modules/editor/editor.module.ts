import { Module } from '@nestjs/common';
import { EditorService } from './editor.service';
import { EditorController } from './editor.controller';
import { AdminAuthorsController } from './admin-authors.controller';
import { MediaModule } from '../media/media.module';
import { RedirectsModule } from '../redirects/redirects.module';
import { IndexNowModule } from '../index-now/index-now.module';

@Module({
  imports: [MediaModule, RedirectsModule, IndexNowModule],
  controllers: [EditorController, AdminAuthorsController],
  providers: [EditorService],
  exports: [EditorService],
})
export class EditorModule {}
