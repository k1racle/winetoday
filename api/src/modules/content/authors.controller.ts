import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { AuthorsService } from './authors.service';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string, @Request() req) {
    return this.authorsService.findAuthorBySlug(slug, req.user?.userId);
  }

  @Get(':slug/content')
  async contentBySlug(@Param('slug') slug: string) {
    return this.authorsService.findAuthorContentBySlug(slug);
  }

  @Post(':slug/subscribe')
  @UseGuards(JwtAuthGuard)
  async subscribe(@Param('slug') slug: string, @Request() req) {
    return this.authorsService.subscribe(slug, req.user.userId);
  }

  @Delete(':slug/unsubscribe')
  @UseGuards(JwtAuthGuard)
  async unsubscribe(@Param('slug') slug: string, @Request() req) {
    return this.authorsService.unsubscribe(slug, req.user.userId);
  }

  @Get(':slug/subscription')
  @UseGuards(OptionalJwtAuthGuard)
  async subscription(@Param('slug') slug: string, @Request() req) {
    return this.authorsService.getSubscription(slug, req.user?.userId);
  }
}
