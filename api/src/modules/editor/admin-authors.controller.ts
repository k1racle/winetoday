import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EditorService } from './editor.service';

@Controller('admin/authors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
export class AdminAuthorsController {
  constructor(private readonly editorService: EditorService) {}

  @Get()
  listAuthors() {
    return this.editorService.listAuthorsAdmin();
  }

  @Get(':id/analytics')
  getAuthorAnalytics(@Param('id') id: string) {
    return this.editorService.getAuthorAnalytics(id);
  }
}
