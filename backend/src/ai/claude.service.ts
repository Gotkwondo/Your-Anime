import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, Content } from '@google/generative-ai';
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
  private readonly genAI: GoogleGenerativeAI;
  private readonly logger = new Logger(ClaudeService.name);
  private readonly MODEL = 'gemini-2.5-flash';
  private readonly MAX_TOKENS = 2048;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('GOOGLE_AI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * 대화 히스토리와 함께 Gemini에 메시지를 전송합니다.
   * existingSessionData가 있으면 시스템 프롬프트에 주입하여 수집된 프로파일을 AI가 인식하도록 합니다.
   */
  async chat(
    userMessage: string,
    conversationHistory: ChatMessage[],
    personaType: PersonaType,
    existingSessionData?: Record<string, unknown>,
  ): Promise<ClaudeResponse> {
    let systemPrompt = getPersonaPrompt(personaType);

    // 기존 session_data가 있으면 시스템 프롬프트에 주입
    if (existingSessionData && Object.keys(existingSessionData).length > 0) {
      const sessionContext = `\n\n## CURRENT SESSION STATE (already collected — do NOT ask again about these)\n\`\`\`json\n${JSON.stringify(existingSessionData, null, 2)}\n\`\`\`\nUse this existing profile data as your starting point. Continue collecting missing dimensions naturally.`;
      systemPrompt += sessionContext;
    }

    // 최근 10개 메시지만 컨텍스트로 포함 (토큰 최적화)
    const recentHistory = conversationHistory.slice(-10);

    // Gemini는 'assistant' 대신 'model' role 사용
    // Gemini 제약: history 첫 번째 메시지는 반드시 'user' role 이어야 함
    const allMapped: Content[] = recentHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
    const firstUserIdx = allMapped.findIndex((m) => m.role === 'user');
    const history: Content[] =
      firstUserIdx > 0 ? allMapped.slice(firstUserIdx) : allMapped;

    const model = this.genAI.getGenerativeModel({
      model: this.MODEL,
      systemInstruction: systemPrompt,
      generationConfig: {
        maxOutputTokens: this.MAX_TOKENS,
      },
    });

    const MAX_RETRIES = 3;
    let lastError: unknown;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(userMessage);
        const rawContent = result.response.text();
        const message = this.extractTextMessage(rawContent);
        return { message, rawContent };
      } catch (error) {
        lastError = error;
        const status = (error as { status?: number })?.status;

        if (status === 404) {
          console.log(error);
        }

        if (status === 429) {
          const delayMs = 1000 * Math.pow(2, attempt); // 1s → 2s → 4s
          this.logger.warn(
            `Gemini 429 rate limit — attempt ${attempt + 1}/${MAX_RETRIES}, retrying in ${delayMs}ms`,
          );
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        // 429 외 에러는 즉시 중단
        break;
      }
    }

    this.logger.error('Gemini API 호출 실패', lastError);
    throw new ServiceUnavailableException({
      success: false,
      error:
        'AI 서비스가 일시적으로 사용 불가합니다. 잠시 후 다시 시도해주세요.',
      statusCode: 503,
    });
  }

  /**
   * 영문 텍스트를 한국어로 번역합니다.
   * 애니메이션 시놉시스 번역에 사용됩니다.
   */
  async translateToKorean(text: string): Promise<string | null> {
    if (!text?.trim()) return null;
    try {
      const model = this.genAI.getGenerativeModel({ model: this.MODEL });
      const prompt = `Translate the following anime synopsis to Korean. Return ONLY the translated text, nothing else.\n\n${text}`;
      const result = await model.generateContent(prompt);
      return result.response.text().trim() || null;
    } catch (error) {
      this.logger.warn('시놉시스 번역 실패', error);
      return null;
    }
  }

  /**
   * Gemini 응답에서 JSON 추천 블록을 파싱합니다.
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
   * 응답 텍스트에서 JSON/session_data 블록을 제거하여 순수 메시지만 반환합니다.
   */
  private extractTextMessage(rawContent: string): string {
    return rawContent
      .replace(/```(?:session_data|json)[\s\S]*?```/g, '')
      .trim();
  }
}
