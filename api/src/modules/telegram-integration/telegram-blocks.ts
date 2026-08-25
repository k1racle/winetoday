import { BadRequestException } from '@nestjs/common';

const SAFE_MEDIA_PATH = /^\/uploads\/[a-zA-Z0-9._-]+$/;
const UNSAFE_HTML = /<(script|style|object|embed|form|input|button|textarea|select)\b|\son[a-z]+\s*=|javascript\s*:|data\s*:\s*text\/html/i;
const EMBED_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'www.youtube-nocookie.com',
  'rutube.ru',
  'www.rutube.ru',
  'vk.com',
  'vkvideo.ru',
  'dzen.ru',
]);

export function validateTelegramBlocks(input: unknown): any[] {
  if (!Array.isArray(input)) throw new BadRequestException('Content blocks must be an array');
  if (input.length > 100) throw new BadRequestException('A material cannot contain more than 100 blocks');

  return input.map((raw, index) => {
    if (!raw || typeof raw !== 'object') throw blockError(index, 'invalid block');
    const block = raw as any;
    const id = requiredText(block.id, index, 'id', 100);
    const title = optionalText(block.title, index, 'title', 200);

    if (block.type === 'text') {
      const content = requiredText(block.content, index, 'content', 1_000_000);
      if (UNSAFE_HTML.test(content) || /<iframe\b/i.test(content)) throw blockError(index, 'unsafe text HTML');
      return { id, type: 'text', title, content };
    }

    if (block.type === 'image') {
      return {
        id,
        type: 'image',
        title,
        data: mediaItem(block.data, index, true),
      };
    }

    if (block.type === 'gallery' || block.type === 'slider') {
      if (!Array.isArray(block.data?.items) || block.data.items.length > 50) {
        throw blockError(index, 'invalid image collection');
      }
      return {
        id,
        type: block.type,
        title,
        data: { items: block.data.items.map((item: any) => mediaItem(item, index, false)) },
      };
    }

    if (block.type === 'embed') {
      const code = optionalText(block.data?.code, index, 'embed code', 10_000).trim();
      if (!code) return { id, type: 'embed', title, data: { code: '' } };
      const match = code.match(/^<iframe\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/iframe>$/i);
      if (!match || /\son[a-z]+\s*=|javascript\s*:/i.test(code)) throw blockError(index, 'only a trusted iframe is allowed');
      let host: string;
      try { host = new URL(match[1]).hostname.toLowerCase(); }
      catch { throw blockError(index, 'invalid iframe URL'); }
      if (!EMBED_HOSTS.has(host)) throw blockError(index, 'unsupported iframe host');
      return { id, type: 'embed', title, data: { code } };
    }

    throw blockError(index, `unsupported type ${String(block.type)}`);
  });
}

function mediaItem(value: any, index: number, withCaption: boolean) {
  if (!value || typeof value !== 'object') throw blockError(index, 'invalid media data');
  const mediaId = optionalText(value.mediaId, index, 'mediaId', 100);
  const path = optionalText(value.path, index, 'path', 500);
  if (Boolean(mediaId) !== Boolean(path)) throw blockError(index, 'mediaId and path must be provided together');
  if (path && !SAFE_MEDIA_PATH.test(path)) throw blockError(index, 'invalid media path');
  return {
    mediaId,
    path,
    ...(withCaption ? { caption: optionalText(value.caption, index, 'caption', 500) } : {}),
    source: optionalText(value.source, index, 'source', 500),
  };
}

function requiredText(value: unknown, index: number, field: string, max: number) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw blockError(index, `invalid ${field}`);
  return value;
}

function optionalText(value: unknown, index: number, field: string, max: number) {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string' || value.length > max) throw blockError(index, `invalid ${field}`);
  return value;
}

function blockError(index: number, message: string) {
  return new BadRequestException(`Block ${index + 1}: ${message}`);
}
