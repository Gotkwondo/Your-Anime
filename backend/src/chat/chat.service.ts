import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';
import { ClaudeService, ChatMessage } from '../ai/claude.service.js';
import { CreateChatDto } from './dto/create-chat.dto.js';
import {
  AnimeRecommendation,
  ChatResponse,
  JikanAnimeData,
} from './interfaces/chat.interface.js';
import { PersonaType } from '../ai/prompts.js';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';
const JIKAN_RATE_LIMIT_DELAY_MS = 400; // Jikan API 속도 제한 대응 (초당 3회)

interface MessageHistoryRow {
  role: string;
  content: string;
}

interface SessionData {
  profileStage?: string;
  turnCount?: number;
  collectedProfile?: Record<string, unknown>;
  readyToRecommend?: boolean;
  [key: string]: unknown;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly claudeService: ClaudeService,
  ) {}

  /**
   * POST /api/chat 핵심 로직
   * 1. 소유권 검증 → 2. 히스토리 로드 → 3. Gemini 호출 → 4. 세션 데이터 저장 → 5. 추천 파싱 → 6. DB 저장
   */
  async processChat(dto: CreateChatDto, userId: string): Promise<ChatResponse> {
    const supabase = this.supabaseService.getServiceRoleClient();
    const { message, conversationId } = dto;

    // 1. conversations 테이블에서 소유권 검증
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id, persona_type, user_id, session_data')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      throw new NotFoundException({
        success: false,
        error: '해당 대화를 찾을 수 없습니다.',
        statusCode: 404,
      });
    }

    if (conversation.user_id !== userId) {
      throw new ForbiddenException({
        success: false,
        error: '이 대화에 접근할 권한이 없습니다.',
        statusCode: 403,
      });
    }

    const personaType = conversation.persona_type as PersonaType;

    // 2. 최근 메시지 20개 로드 + 기존 session_data
    const { data: rawRecentMessages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(10);

    const recentMessages =
      (rawRecentMessages as unknown as MessageHistoryRow[] | null) ?? [];
    const conversationHistory: ChatMessage[] = recentMessages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    const existingSessionData =
      (conversation.session_data as SessionData) ?? {};

    // 4. Gemini API 호출 (기존 session_data를 컨텍스트로 주입)
    const { message: aiMessage, rawContent } = await this.claudeService.chat(
      message,
      conversationHistory,
      personaType,
      existingSessionData,
    );

    // 5. session_data 블록 파싱 후 conversations 테이블에 저장
    const newSessionData = this.parseSessionData(rawContent);
    if (newSessionData) {
      await supabase
        .from('conversations')
        .update({
          session_data: newSessionData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId);
    } else {
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    }

    // 6. 응답에서 추천 JSON 블록 파싱
    const parsedRecs = this.claudeService.parseRecommendations(rawContent);
    const isRecommendation = parsedRecs !== null && parsedRecs.length > 0;

    // 7. 추천된 애니메이션 정보 수집 (캐시 우선, 없으면 Jikan API)
    let recommendations: AnimeRecommendation[] | undefined;
    if (isRecommendation) {
      recommendations = await this.fetchAnimeDetails(parsedRecs);
    }

    // 8. 메시지 임베딩 생성 — 자체 파이프라인 구축 전까지 비활성화
    const userEmbedding: number[] | null = null;
    const assistantEmbedding: number[] | null = null;

    // 9. messages 테이블에 user/assistant 메시지 INSERT
    // 프론트 AnimeReference와 동일한 camelCase 전체 데이터 저장 (히스토리 로드 시 재사용)
    const animeRefs = recommendations
      ? recommendations.map((r) => ({
          malId: r.malId,
          title: r.title,
          titleJapanese: r.titleJapanese,
          imageUrl: r.imageUrl,
          score: r.score,
          genres: r.genres,
          episodes: r.episodes,
          status: r.status,
          synopsis: r.synopsis,
          url: r.url,
          aiReasoning: r.aiReasoning,
        }))
      : [];

    const { error: insertError } = await supabase.from('messages').insert([
      {
        conversation_id: conversationId,
        role: 'user',
        content: message,
        embedding: userEmbedding,
        anime_references: [],
      },
      {
        conversation_id: conversationId,
        role: 'assistant',
        content: aiMessage,
        embedding: assistantEmbedding,
        anime_references: animeRefs,
      },
    ]);

    if (insertError) {
      this.logger.error('메시지 저장 실패', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      });
      throw new BadRequestException({
        success: false,
        error: '메시지를 저장하는 중 오류가 발생했습니다.',
        statusCode: 400,
      });
    }

    return {
      data: {
        conversationId,
        message: aiMessage,
        messageType: isRecommendation ? 'recommendation' : 'chat',
      },
      isOrganized: isRecommendation,
      organizedData: recommendations,
    };
  }

  /**
   * AI 응답에서 session_data 블록을 파싱합니다.
   * ```session_data {...} ``` 형태의 블록을 추출합니다.
   */
  private parseSessionData(rawContent: string): SessionData | null {
    const sessionDataRegex = /```session_data\s*([\s\S]*?)\s*```/;
    const match = rawContent.match(sessionDataRegex);

    if (!match || !match[1]) {
      return null;
    }

    try {
      return JSON.parse(match[1]) as SessionData;
    } catch {
      this.logger.warn('session_data 파싱 실패', { rawContent });
      return null;
    }
  }

  /**
   * 애니메이션 상세 정보를 가져옵니다.
   * anime_cache 우선 조회 → 없으면 Jikan API 호출 후 캐싱
   */
  private async fetchAnimeDetails(
    parsedRecs: Array<{ mal_id: number; title: string; reasoning: string }>,
  ): Promise<AnimeRecommendation[]> {
    const supabase = this.supabaseService.getServiceRoleClient();
    const malIds = parsedRecs.map((r) => r.mal_id);

    // 캐시에서 조회
    const { data: cachedAnime } = await supabase
      .from('anime_cache')
      .select('mal_id, data, expires_at')
      .in('mal_id', malIds)
      .gt('expires_at', new Date().toISOString());

    type CachedData = JikanAnimeData & { synopsis_ko?: string | null };

    const cachedMap = new Map<number, CachedData>(
      (cachedAnime ?? []).map((item) => [item.mal_id, item.data as CachedData]),
    );

    const results: AnimeRecommendation[] = [];

    for (const rec of parsedRecs) {
      const reasoningForRec = rec.reasoning;
      let animeData: CachedData | undefined = cachedMap.get(rec.mal_id);

      // 캐시 미스: Jikan API 호출
      if (!animeData) {
        try {
          const fetched = await this.fetchFromJikan(rec.mal_id);
          if (fetched) {
            // 시놉시스 한글 번역
            const synopsisKo = fetched.synopsis
              ? await this.claudeService.translateToKorean(fetched.synopsis)
              : null;

            animeData = { ...fetched, synopsis_ko: synopsisKo };

            // 번역 포함하여 캐시 저장
            await supabase.from('anime_cache').upsert({
              mal_id: rec.mal_id,
              title: animeData.title,
              title_english: null,
              title_japanese: animeData.title_japanese,
              data: animeData,
              cached_at: new Date().toISOString(),
              expires_at: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000,
              ).toISOString(),
            });
          }
        } catch (error) {
          this.logger.warn(
            `Jikan API 호출 실패 (mal_id: ${rec.mal_id})`,
            error,
          );
        }
      } else if (animeData.synopsis && !animeData.synopsis_ko) {
        // 캐시에 한글 번역이 없으면 번역 후 캐시 업데이트
        const synopsisKo = await this.claudeService.translateToKorean(
          animeData.synopsis,
        );
        animeData = { ...animeData, synopsis_ko: synopsisKo };
        await supabase
          .from('anime_cache')
          .update({ data: animeData })
          .eq('mal_id', rec.mal_id);
      }

      if (animeData) {
        results.push(this.mapToAnimeRecommendation(animeData, reasoningForRec));
      }
    }

    return results;
  }

  /**
   * Jikan API에서 애니메이션 데이터를 가져옵니다.
   */
  private async fetchFromJikan(malId: number): Promise<JikanAnimeData | null> {
    // Jikan API 속도 제한 대응
    await new Promise((resolve) =>
      setTimeout(resolve, JIKAN_RATE_LIMIT_DELAY_MS),
    );

    const response = await fetch(`${JIKAN_BASE_URL}/anime/${malId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Jikan API 응답 오류: ${response.status}`);
    }

    const json = (await response.json()) as { data: JikanAnimeData };
    return json.data;
  }

  /**
   * Jikan 데이터를 AnimeRecommendation 형식으로 변환합니다.
   */
  private mapToAnimeRecommendation(
    data: JikanAnimeData & { synopsis_ko?: string | null },
    aiReasoning: string,
  ): AnimeRecommendation {
    return {
      malId: data.mal_id,
      title: data.title,
      titleJapanese: data.title_japanese,
      imageUrl:
        data.images?.jpg?.large_image_url ??
        data.images?.jpg?.image_url ??
        null,
      score: data.score,
      genres: (data.genres ?? []).map((g) => g.name),
      episodes: data.episodes,
      status: data.status,
      synopsis: data.synopsis,
      synopsisKo: data.synopsis_ko ?? null,
      url: data.url,
      aiReasoning,
    };
  }
}
