import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { HealthController } from './health.controller';
import { RedisThrottlerStorage } from './common/throttler/redis-throttler.storage';
import { AuthModule } from './modules/auth/auth.module';
import { ContentModule } from './modules/content/content.module';
import { EditorModule } from './modules/editor/editor.module';
import { MediaModule } from './modules/media/media.module';
import { SettingsModule } from './modules/settings/settings.module';
import { CommunityModule } from './modules/community/community.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: 60000,
            limit: 100,
          },
          {
            name: 'auth',
            ttl: 60000,
            limit: 10,
          },
        ],
        storage: new RedisThrottlerStorage(config.get('REDIS_URL') || 'redis://localhost:6379'),
      }),
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        stores: [
          new KeyvRedis(config.get('REDIS_URL') || 'redis://localhost:6379'),
        ],
        ttl: 60_000,
      }),
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ContentModule,
    EditorModule,
    MediaModule,
    SettingsModule,
    CommunityModule,
    AnalyticsModule,
    SchedulerModule,

    UsersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
