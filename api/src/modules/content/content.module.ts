import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { AdminContentController } from './admin-content.controller';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';

@Module({
  controllers: [ContentController, AdminContentController, AuthorsController],
  providers: [ContentService, AuthorsService],
  exports: [ContentService, AuthorsService],
})
export class ContentModule {}
