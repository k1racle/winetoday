import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { AdminContentController } from './admin-content.controller';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';
import { RedirectsModule } from '../redirects/redirects.module';

@Module({
  imports: [RedirectsModule],
  controllers: [ContentController, AdminContentController, AuthorsController],
  providers: [ContentService, AuthorsService],
  exports: [ContentService, AuthorsService],
})
export class ContentModule {}
