import { Module } from '@nestjs/common';
import { EditorService } from './editor.service';
import { EditorController } from './editor.controller';
import { AdminAuthorsController } from './admin-authors.controller';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [MediaModule],
  controllers: [EditorController, AdminAuthorsController],
  providers: [EditorService],
  exports: [EditorService],
})
export class EditorModule {}
