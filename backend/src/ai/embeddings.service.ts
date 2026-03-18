import { Injectable, Logger } from '@nestjs/common';

// TODO: 자체 임베딩 파이프라인 구축 예정. 현재 외부 서비스 비활성화.
@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);

  async embedText(_text: string): Promise<number[] | null> {
    this.logger.debug('임베딩 비활성화 상태 — null 반환');
    return null;
  }

  async embedTexts(texts: string[]): Promise<Array<number[] | null>> {
    this.logger.debug('임베딩 비활성화 상태 — null 배열 반환');
    return texts.map(() => null);
  }
}
