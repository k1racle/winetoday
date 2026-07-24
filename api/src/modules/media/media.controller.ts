import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as crypto from 'crypto';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  list(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    return this.mediaService.findAll(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
      { type: type as any, search },
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.mediaService.findById(id);
  }

  @Get(':id/usage')
  async usage(@Param('id') id: string) {
    return this.mediaService.getUsage(id);
  }

  @Get(':id/file')
  async findOneFile(@Param('id') id: string, @Res() res: any) {
    const media = await this.mediaService.findById(id);
    if (!media?.path) {
      throw new NotFoundException('Media not found');
    }
    return res.redirect(media.path);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.editor)
  async delete(@Param('id') id: string) {
    return this.mediaService.delete(id);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.editor, Role.author)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname);
          const name = crypto.randomUUID();
          cb(null, `${name}${ext}`);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.mediaService.createFromUpload(file);
  }

  @Post('cover')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.editor, Role.author)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname);
          const name = crypto.randomUUID();
          cb(null, `${name}${ext}`);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  uploadCover(@UploadedFile() file: Express.Multer.File) {
    return this.mediaService.createCoverFromUpload(file);
  }

  @Post('archive-cover')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.editor, Role.author)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname);
          const name = crypto.randomUUID();
          cb(null, `${name}${ext}`);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  uploadArchiveCover(@UploadedFile() file: Express.Multer.File) {
    return this.mediaService.createCoverFromUpload(file);
  }
}
