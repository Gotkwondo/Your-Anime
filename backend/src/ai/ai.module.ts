import { Module } from '@nestjs/common';
import { ClaudeService } from './claude.service.js';
import { EmbeddingsService } from './embeddings.service.js';

@Module({
  providers: [ClaudeService, EmbeddingsService],
  exports: [ClaudeService, EmbeddingsService],
})
export class AiModule {}
