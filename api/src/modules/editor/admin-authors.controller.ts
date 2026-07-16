import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EditorService } from './editor.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Controller('admin/authors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
export class AdminAuthorsController {
  constructor(private readonly editorService: EditorService) {}

  @Get()
  listAuthors() {
    return this.editorService.listAuthorsAdmin();
  }

  @Post()
  createAuthor(@Body() dto: CreateAuthorDto) {
    return this.editorService.createAuthor(dto);
  }

  @Get(':id/analytics')
  getAuthorAnalytics(@Param('id') id: string) {
    return this.editorService.getAuthorAnalytics(id);
  }

  @Patch(':id')
  updateAuthor(@Param('id') id: string, @Body() dto: UpdateAuthorDto) {
    return this.editorService.updateAuthor(id, dto);
  }

  @Delete(':id')
  deleteAuthor(@Param('id') id: string) {
    return this.editorService.deleteAuthor(id);
  }
}
