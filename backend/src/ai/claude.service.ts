import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { getPersonaPrompt, PersonaType } from './prompts.js';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  message: string;
  rawContent: string;
}

@Injectable()
export class ClaudeService {
  private readonly client: Anthropic;
  private readonly logger = new Logger(ClaudeService.name);
  private readonly MODEL = 'claude-sonnet-4-5';
  private readonly MAX_TOKENS = 2048;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('ANTHROPIC_API_KEY');
    this.client = new Anthropic({ apiKey });
  }

  /**
   * 대화 히스토리와 함께 Claude에 메시지를 전송합니다.
   */
  async chat(
    userMessage: string,
    conversationHistory: ChatMessage[],
    personaType: PersonaType,
  ): Promise<ClaudeResponse> {
    const systemPrompt = getPersonaPrompt(personaType);

    // 최근 20개 메시지만 컨텍스트로 포함 (토큰 최적화)
    const recentHistory = conversationHistory.slice(-20);

    const messages: Anthropic.MessageParam[] = [
      ...recentHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: userMessage,
      },
    ];

    try {
      const response = await this.client.messages.create({
        model: this.MODEL,
        max_tokens: this.MAX_TOKENS,
        system: systemPrompt,
        messages,
      });

      const contentBlock = response.content[0];
      if (!contentBlock || contentBlock.type !== 'text') {
        throw new Error('Claude로부터 유효한 응답을 받지 못했습니다.');
      }

      const rawContent = contentBlock.text;
      // JSON 블록을 제거한 순수 텍스트 메시지 추출
      const message = this.extractTextMessage(rawContent);

      return { message, rawContent };
    } catch (error) {
      this.logger.error('Claude API 호출 실패', error);

      if (error instanceof Anthropic.APIError) {
        throw new ServiceUnavailableException({
          success: false,
          error:
            'AI 서비스가 일시적으로 사용 불가합니다. 잠시 후 다시 시도해주세요.',
          statusCode: 503,
        });
      }

      throw error;
    }
  }

  /**
   * Claude 응답에서 JSON 추천 블록을 파싱합니다.
   * ```json {...} ``` 형태의 블록을 추출합니다.
   */
  parseRecommendations(rawContent: string): Array<{
    mal_id: number;
    title: string;
    reasoning: string;
  }> | null {
    const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = rawContent.match(jsonBlockRegex);

    if (!match || !match[1]) {
      return null;
    }

    try {
      const parsed = JSON.parse(match[1]) as {
        recommendations?: Array<{
          mal_id: number;
          title: string;
          reasoning: string;
        }>;
      };

      if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
        return null;
      }

      // 유효한 항목만 필터링
      return parsed.recommendations.filter(
        (rec) =>
          typeof rec.mal_id === 'number' &&
          rec.mal_id > 0 &&
          typeof rec.title === 'string' &&
          typeof rec.reasoning === 'string',
      );
    } catch (error) {
      this.logger.warn('추천 JSON 파싱 실패', {
        rawContent,
        error: error as unknown,
      });
      return null;
    }
  }

  /**
   * 응답 텍스트에서 JSON 블록을 제거하여 순수 메시지만 반환합니다.
   */
  private extractTextMessage(rawContent: string): string {
    return rawContent.replace(/```json\s*[\s\S]*?\s*```/g, '').trim();
  }
}
