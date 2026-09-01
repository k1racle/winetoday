import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContentType } from '@prisma/client';

const INDEX_NOW_ENDPOINT = 'https://yandex.com/indexnow';
const INDEX_NOW_KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;
const MAX_URLS_PER_REQUEST = 10_000;
const REQUEST_TIMEOUT_MS = 5_000;

const CONTENT_PATH_PREFIX: Partial<Record<ContentType, string>> = {
  article: '/articles',
  news: '/news',
  video: '/videos',
  gallery: '/gallery',
};

export type IndexableContent = {
  type: ContentType;
  slug: string;
};

@Injectable()
export class IndexNowService {
  private readonly logger = new Logger(IndexNowService.name);
  private readonly key: string | null;
  private readonly siteOrigin: string | null;

  constructor(config: ConfigService) {
    const key = config.get<string>('INDEXNOW_KEY')?.trim() || '';
    if (!key) {
      this.key = null;
      this.siteOrigin = null;
      return;
    }

    if (!INDEX_NOW_KEY_PATTERN.test(key)) {
      this.key = null;
      this.siteOrigin = null;
      this.logger.warn('IndexNow is disabled because INDEXNOW_KEY is invalid');
      return;
    }

    const siteUrl = this.parseSiteUrl(config.get<string>('SITE_URL'));
    if (!siteUrl) {
      this.key = null;
      this.siteOrigin = null;
      this.logger.warn('IndexNow is disabled because SITE_URL is invalid');
      return;
    }

    this.key = key;
    this.siteOrigin = siteUrl.origin;
  }

  async notifyContent(items: IndexableContent[]): Promise<void> {
    if (!this.key || !this.siteOrigin) return;

    const urls = items
      .map((item) => this.contentUrl(item))
      .filter((url): url is string => Boolean(url));

    await this.notifyUrls(urls);
  }

  async notifyUrls(urls: string[]): Promise<void> {
    if (!this.key || !this.siteOrigin) return;

    const uniqueUrls = Array.from(new Set(urls)).filter((value) => {
      try {
        return new URL(value).origin === this.siteOrigin;
      } catch {
        return false;
      }
    });

    for (let offset = 0; offset < uniqueUrls.length; offset += MAX_URLS_PER_REQUEST) {
      await this.submitBatch(uniqueUrls.slice(offset, offset + MAX_URLS_PER_REQUEST));
    }
  }

  private async submitBatch(urlList: string[]): Promise<void> {
    if (!this.key || !this.siteOrigin || urlList.length === 0) return;

    try {
      const response = await fetch(INDEX_NOW_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          host: new URL(this.siteOrigin).host,
          key: this.key,
          keyLocation: `${this.siteOrigin}/${this.key}.txt`,
          urlList,
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (response.status === 200 || response.status === 202) {
        this.logger.log(`IndexNow accepted ${urlList.length} URL(s) with status ${response.status}`);
        return;
      }

      this.logger.warn(`IndexNow rejected ${urlList.length} URL(s) with status ${response.status}`);
    } catch {
      this.logger.warn(`IndexNow request failed for ${urlList.length} URL(s)`);
    }
  }

  private contentUrl(item: IndexableContent): string | null {
    if (!this.siteOrigin || !item.slug) return null;
    const prefix = CONTENT_PATH_PREFIX[item.type];
    if (!prefix) return null;
    return new URL(`${prefix}/${encodeURIComponent(item.slug)}`, this.siteOrigin).toString();
  }

  private parseSiteUrl(value?: string): URL | null {
    try {
      const url = new URL(value || '');
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
        return null;
      }
      return url;
    } catch {
      return null;
    }
  }
}
