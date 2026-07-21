import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ContentType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { ContentService } from './content.service';
import { ListContentDto } from './dto/list-content.dto';
import { ReactDto } from './dto/react.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller()
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('content')
  listContent(@Query() query: ListContentDto) {
    return this.contentService.findMany(query);
  }

  @Get('articles')
  listArticles(@Query() query: ListContentDto) {
    query.type = ContentType.article;
    return this.contentService.findMany(query);
  }

  @Get('articles/:slug')
  articleDetail(
    @Param('slug') slug: string,
    @Query('preview', new ParseBoolPipe({ optional: true })) preview?: boolean,
  ) {
    return this.contentService.findBySlug(ContentType.article, slug, { preview });
  }

  @Get('news')
  listNews(@Query() query: ListContentDto) {
    query.type = ContentType.news;
    return this.contentService.findMany(query);
  }

  @Get('news/:slug')
  newsDetail(
    @Param('slug') slug: string,
    @Query('preview', new ParseBoolPipe({ optional: true })) preview?: boolean,
  ) {
    return this.contentService.findBySlug(ContentType.news, slug, { preview });
  }

  @Get('videos')
  listVideos(@Query() query: ListContentDto) {
    query.type = ContentType.video;
    return this.contentService.findMany(query);
  }

  @Get('videos/:slug')
  videoDetail(
    @Param('slug') slug: string,
    @Query('preview', new ParseBoolPipe({ optional: true })) preview?: boolean,
  ) {
    return this.contentService.findBySlug(ContentType.video, slug, { preview });
  }

  @Get('galleries')
  listGalleries(@Query() query: ListContentDto) {
    query.type = ContentType.gallery;
    return this.contentService.findMany(query);
  }

  @Get('galleries/:slug')
  galleryDetail(
    @Param('slug') slug: string,
    @Query('preview', new ParseBoolPipe({ optional: true })) preview?: boolean,
  ) {
    return this.contentService.findBySlug(ContentType.gallery, slug, { preview });
  }

  @Get('categories')
  categories() {
    return this.contentService.findCategories();
  }

  @Get('tags')
  tags() {
    return this.contentService.findTags();
  }

  @Get('latest-by-category')
  latestByCategory(@Query('limit') limit?: string) {
    return this.contentService.findLatestByCategory(limit ? parseInt(limit, 10) : 5);
  }

  @Get('homepage')
  homepage() {
    return this.contentService.findHomepageContent();
  }

  @Get('content/:id/reactions')
  @UseGuards(OptionalJwtAuthGuard)
  reactions(@Param('id') id: string, @Request() req, @Query('viewerId') viewerId?: string) {
    return this.contentService.getReactions(id, req.user?.userId, viewerId);
  }

  @Post('content/:id/react')
  @UseGuards(OptionalJwtAuthGuard)
  react(@Param('id') id: string, @Request() req, @Body() dto: ReactDto) {
    return this.contentService.react(id, req.user?.userId, dto.viewerId, dto.type);
  }

  @Get('content/:id/comments')
  comments(@Param('id') id: string) {
    return this.contentService.getComments(id);
  }

  @Post('content/:id/comments')
  @UseGuards(JwtAuthGuard)
  createComment(@Param('id') id: string, @Request() req, @Body() dto: CreateCommentDto) {
    return this.contentService.createComment(id, req.user.userId, dto.body);
  }

  @Delete('content/:id/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  deleteComment(@Param('id') _id: string, @Param('commentId') commentId: string, @Request() req) {
    return this.contentService.deleteComment(commentId, req.user.userId);
  }
}
