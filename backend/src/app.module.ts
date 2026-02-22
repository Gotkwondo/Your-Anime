import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { SupabaseModule } from './supabase/supabase.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AiModule } from './ai/ai.module.js';
import { ChatModule } from './chat/chat.module.js';
import { ConversationsModule } from './conversations/conversations.module.js';
import { AnimeModule } from './anime/anime.module.js';

@Module({
  imports: [
    // 환경변수 전역 설정
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),

    // Rate limiting: 분당 30회, 시간당 200회 제한
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1분
        limit: 30,
      },
      {
        name: 'long',
        ttl: 3600000, // 1시간
        limit: 200,
      },
    ]),

    // 전역 Supabase 모듈 (Global 데코레이터로 모든 모듈에서 사용 가능)
    SupabaseModule,

    // 기능 모듈
    AuthModule,
    AiModule,
    ChatModule,
    ConversationsModule,
    AnimeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
