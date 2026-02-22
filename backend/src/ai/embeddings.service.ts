import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingsService {
  private readonly client: OpenAI;
  private readonly logger = new Logger(EmbeddingsService.name);
  private readonly MODEL = 'text-embedding-3-small';
  private readonly EMBEDDING_DIMENSIONS = 1536;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('OPENAI_API_KEY');
    this.client = new OpenAI({ apiKey });
  }

  /**
   * 단일 텍스트의 임베딩 벡터를 생성합니다.
   * text-embedding-3-small 모델 사용 (1536 차원)
   */
  async embedText(text: string): Promise<number[]> {
    // 텍스트 길이 제한 (토큰 절약)
    const truncatedText = text.slice(0, 8000);

    try {
      const response = await this.client.embeddings.create({
        model: this.MODEL,
        input: truncatedText,
        dimensions: this.EMBEDDING_DIMENSIONS,
      });

      const embedding = response.data[0]?.embedding;
      if (!embedding) {
        throw new Error('임베딩 데이터를 받지 못했습니다.');
      }

      return embedding;
    } catch (error) {
      this.logger.error('임베딩 생성 실패', error);
      throw error;
    }
  }

  /**
   * 여러 텍스트의 임베딩을 배치로 생성합니다.
   * API 비용 최적화를 위해 배치 처리를 권장합니다.
   */
  async embedTexts(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    const truncatedTexts = texts.map((t) => t.slice(0, 8000));

    try {
      const response = await this.client.embeddings.create({
        model: this.MODEL,
        input: truncatedTexts,
        dimensions: this.EMBEDDING_DIMENSIONS,
      });

      return response.data
        .sort((a, b) => a.index - b.index)
        .map((item) => item.embedding);
    } catch (error) {
      this.logger.error('배치 임베딩 생성 실패', error);
      throw error;
    }
  }
}
