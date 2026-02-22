import { Module } from '@nestjs/common';
import { AnimeController } from './anime.controller.js';
import { AnimeService } from './anime.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [AnimeController],
  providers: [AnimeService],
})
export class AnimeModule {}
