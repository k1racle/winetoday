import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EditorService, RequestUser } from './editor.service';
import { CreateDraftDto } from './dto/create-draft.dto';

@Controller('editor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin, Role.editor, Role.author)
export class EditorController {
  constructor(private readonly editorService: EditorService) {}

  @Post('drafts')
  saveDraft(@Body() dto: CreateDraftDto, @Request() req) {
    return this.editorService.saveDraft(req.user as RequestUser, dto);
  }

  @Get('drafts/:id')
  getDraft(@Param('id') id: string, @Request() req) {
    return this.editorService.findDraft(req.user as RequestUser, id);
  }

  @Get('materials')
  listMaterials(
    @Request() req,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('authorId') authorId?: string,
    @Query('authorName') authorName?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: 'asc' | 'desc',
  ) {
    return this.editorService.listMaterials(req.user as RequestUser, {
      type,
      status,
      search,
      authorId,
      authorName,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      sort,
      order,
    });
  }

  @Get('authors')
  listAuthors() {
    return this.editorService.listAuthors();
  }
}
