import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
export class AdminContentController {
  constructor(private readonly contentService: ContentService) {}

  // Categories
  @Get('categories')
  adminCategories() {
    return this.contentService.findCategories();
  }

  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.contentService.createCategory(dto);
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.contentService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.contentService.deleteCategory(id);
  }

  // Tags
  @Get('tags')
  adminTags() {
    return this.contentService.findTags();
  }

  @Post('tags')
  createTag(@Body() dto: CreateTagDto) {
    return this.contentService.createTag(dto);
  }

  @Patch('tags/:id')
  updateTag(@Param('id') id: string, @Body() dto: UpdateTagDto) {
    return this.contentService.updateTag(id, dto);
  }

  @Delete('tags/:id')
  deleteTag(@Param('id') id: string) {
    return this.contentService.deleteTag(id);
  }
}
