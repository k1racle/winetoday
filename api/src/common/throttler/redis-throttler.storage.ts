import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import Redis from 'ioredis';

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage, OnApplicationShutdown {
  private readonly redis: Redis;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
    });
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const fullKey = `throttler:${throttlerName}:${key}`;
    const blockKey = `${fullKey}:blocked`;
    const now = Date.now();

    const pipeline = this.redis.pipeline();
    pipeline.pttl(blockKey);
    pipeline.get(fullKey);
    const [[, blockTtlRaw], [, hitsRaw]] = await pipeline.exec();

    const blockTtl = typeof blockTtlRaw === 'number' ? blockTtlRaw : 0;
    const hitsStr = typeof hitsRaw === 'string' ? hitsRaw : null;
    const currentHits = hitsStr ? parseInt(hitsStr, 10) : 0;

    if (blockTtl > 0) {
      return {
        totalHits: currentHits,
        timeToExpire: now + blockTtl,
        isBlocked: true,
        timeToBlockExpire: now + blockTtl,
      };
    }

    const hits = await this.redis.incr(fullKey);
    if (hits === 1) {
      await this.redis.pexpire(fullKey, ttl);
    }

    const timeToExpire = now + ttl;
    const isBlocked = hits > limit;

    if (isBlocked && blockDuration > 0) {
      await this.redis.psetex(blockKey, blockDuration, '1');
    }

    return {
      totalHits: hits,
      timeToExpire,
      isBlocked,
      timeToBlockExpire: isBlocked ? now + blockDuration : 0,
    };
  }

  async onApplicationShutdown() {
    await this.redis.quit();
  }
}
