import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ContentStatus, ContentType } from '@prisma/client';
import * as crypto from 'crypto';
import * as path from 'path';
import { CreateDraftDto } from '../editor/dto/create-draft.dto';
import { EditorService } from '../editor/editor.service';
import { MediaService } from '../media/media.service';
import { ContentService } from '../content/content.service';
import { ClaimTelegramLinkDto } from './dto/claim-telegram-link.dto';
import { IntegrationTokenGuard } from './integration-token.guard';
import { TelegramIntegrationService } from './telegram-integration.service';
import { validateTelegramBlocks } from './telegram-blocks';

const TELEGRAM_STATUSES = new Set<ContentStatus>([
  ContentStatus.draft,
  ContentStatus.published,
  ContentStatus.scheduled,
]);

@Controller('integrations/telegram')
@UseGuards(IntegrationTokenGuard)
export class TelegramEditorController {
  constructor(
    private readonly telegram: TelegramIntegrationService,
    private readonly editor: EditorService,
    private readonly media: MediaService,
    private readonly content: ContentService,
  ) {}

  @Post('claim')
  claim(@Body() dto: ClaimTelegramLinkDto) {
    return this.telegram.claim(dto);
  }

  @Get('me')
  async me(@Headers('x-telegram-user-id') telegramUserId?: string) {
    const user = await this.telegram.resolveEditor(telegramUserId);
    return { id: user.userId, email: user.email, role: user.role };
  }

  @Get('categories')
  async categories(@Headers('x-telegram-user-id') telegramUserId?: string) {
    await this.telegram.resolveEditor(telegramUserId);
    return this.content.findCategories();
  }

  @Get('tags')
  async tags(@Headers('x-telegram-user-id') telegramUserId?: string) {
    await this.telegram.resolveEditor(telegramUserId);
    return this.content.findTags();
  }

  @Get('authors')
  async authors(@Headers('x-telegram-user-id') telegramUserId?: string) {
    await this.telegram.resolveEditor(telegramUserId);
    return this.editor.listAuthors();
  }

  @Get('materials')
  async materials(
    @Headers('x-telegram-user-id') telegramUserId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const user = await this.telegram.resolveEditor(telegramUserId);
    return this.editor.listMaterials(user, {
      type,
      status,
      search,
      limit: limit ? parseInt(limit, 10) : 30,
      offset: offset ? parseInt(offset, 10) : 0,
      sort: 'updatedAt',
      order: 'desc',
    });
  }

  @Get('materials/:id')
  async material(
    @Headers('x-telegram-user-id') telegramUserId: string | undefined,
    @Param('id') id: string,
  ) {
    const user = await this.telegram.resolveEditor(telegramUserId);
    const item = await this.editor.findDraft(user, id);
    return {
      ...item,
      contentBlocks: await normalizeLegacyBlocks(item.contentBlocks, this.media),
    };
  }

  @Post('drafts')
  async saveDraft(
    @Headers('x-telegram-user-id') telegramUserId: string | undefined,
    @Body() dto: CreateDraftDto,
  ) {
    const user = await this.telegram.resolveEditor(telegramUserId);
    if (dto.type !== ContentType.article && dto.type !== ContentType.news) {
      throw new BadRequestException('Telegram editor supports only articles and news');
    }
    if (dto.status && !TELEGRAM_STATUSES.has(dto.status)) {
      throw new BadRequestException('Unsupported material status');
    }
    dto.contentBlocks = validateTelegramBlocks(dto.contentBlocks ?? []);
    return this.editor.saveDraft(user, dto);
  }

  @Post('media')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  async upload(
    @Headers('x-telegram-user-id') telegramUserId: string | undefined,
    @UploadedFile() file: Express.Multer.File,
  ) {
    await this.telegram.resolveEditor(telegramUserId);
    if (!file) throw new BadRequestException('File is required');
    return this.media.createFromUpload(file);
  }
}

async function normalizeLegacyBlocks(blocks: unknown, media: MediaService) {
  if (!Array.isArray(blocks)) return [];
  const ids = new Set<string>();
  for (const block of blocks as any[]) {
    if (block?.type === 'image-highlight' && block.imageId) ids.add(String(block.imageId));
    if ((block?.type === 'image-gallery' || block?.type === 'image-slider') && Array.isArray(block.imageIds)) {
      block.imageIds.forEach((id: unknown) => { if (id) ids.add(String(id)); });
    }
  }
  const resolved = await Promise.all(Array.from(ids).map(async (id) => [id, await media.findById(id)] as const));
  const paths = new Map(resolved.filter((entry) => entry[1]?.path).map(([id, item]) => [id, item!.path]));

  return (blocks as any[]).map((block) => {
    if (block?.type === 'image-highlight') {
      return {
        id: block.id,
        type: 'image',
        title: block.title,
        data: {
          mediaId: block.imageId || '',
          path: paths.get(String(block.imageId)) || '',
          caption: block.caption || '',
          source: block.credit || '',
        },
      };
    }
    if (block?.type === 'image-gallery' || block?.type === 'image-slider') {
      const items = (block.imageIds || []).map((id: string) => ({
        mediaId: id,
        path: paths.get(String(id)) || '',
        source: block.photoSource || '',
      })).filter((item: { path: string }) => item.path);
      return {
        id: block.id,
        type: block.type === 'image-gallery' ? 'gallery' : 'slider',
        title: block.title,
        data: { items },
      };
    }
    if (block?.type === 'quote') {
      const quote = escapeHtml(String(block.text || ''));
      const author = escapeHtml(String(block.author || ''));
      const role = escapeHtml(String(block.role || ''));
      const attribution = author ? `<p><strong>${author}</strong>${role ? `, ${role}` : ''}</p>` : '';
      return { id: block.id, type: 'text', title: block.title || 'Цитата', content: `<blockquote><p>${quote}</p>${attribution}</blockquote>` };
    }
    return block;
  });
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
