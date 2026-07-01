import { Controller, Get, Param, ParseBoolPipe, Query } from '@nestjs/common';
import { ContentType } from '@prisma/client';
import { ContentService } from './content.service';
import { ListContentDto } from './dto/list-content.dto';

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
}
