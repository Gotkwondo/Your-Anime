import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';
import { ClaudeService, ChatMessage } from '../ai/claude.service.js';
import { EmbeddingsService } from '../ai/embeddings.service.js';
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

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly claudeService: ClaudeService,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  /**
   * POST /api/chat 핵심 로직
   * 1. 소유권 검증 → 2. 히스토리 로드 → 3. Claude 호출 → 4. 추천 파싱 → 5. 캐시/Jikan → 6. DB 저장
   */
  async processChat(dto: CreateChatDto, userId: string): Promise<ChatResponse> {
    const supabase = this.supabaseService.getServiceRoleClient();
    const { message, conversationId } = dto;

    // 1. conversations 테이블에서 소유권 검증
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id, persona_type, user_id')
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

    // 2. 최근 메시지 20개 로드 (대화 히스토리)
    const { data: rawRecentMessages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(20);

    const recentMessages =
      (rawRecentMessages as unknown as MessageHistoryRow[] | null) ?? [];
    const conversationHistory: ChatMessage[] = recentMessages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // 3. Claude API 호출
    const { message: aiMessage, rawContent } = await this.claudeService.chat(
      message,
      conversationHistory,
      personaType,
    );

    // 4. 응답에서 추천 JSON 블록 파싱
    const parsedRecs = this.claudeService.parseRecommendations(rawContent);

    // 5. 추천된 애니메이션 정보 수집 (캐시 우선, 없으면 Jikan API)
    let recommendations: AnimeRecommendation[] | undefined;
    if (parsedRecs && parsedRecs.length > 0) {
      recommendations = await this.fetchAnimeDetails(parsedRecs);
    }

    // 6. 메시지 임베딩 생성 (비동기 처리 - 실패해도 응답은 반환)
    let userEmbedding: number[] | null = null;
    let assistantEmbedding: number[] | null = null;
    try {
      [userEmbedding, assistantEmbedding] =
        await this.embeddingsService.embedTexts([message, aiMessage]);
    } catch (embeddingError) {
      this.logger.warn('임베딩 생성 실패 (응답은 계속 진행)', embeddingError);
    }

    // 7. messages 테이블에 user/assistant 메시지 INSERT
    const animeRefs = recommendations
      ? recommendations.map((r) => ({ mal_id: r.malId, title: r.title }))
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
      this.logger.error('메시지 저장 실패', insertError);
      throw new BadRequestException({
        success: false,
        error: '메시지를 저장하는 중 오류가 발생했습니다.',
        statusCode: 400,
      });
    }

    // 8. conversations.updated_at 갱신
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return {
      message: aiMessage,
      conversationId,
      recommendations,
    };
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

    const cachedMap = new Map<number, JikanAnimeData>(
      (cachedAnime ?? []).map((item) => [
        item.mal_id,
        item.data as JikanAnimeData,
      ]),
    );

    const results: AnimeRecommendation[] = [];

    for (const rec of parsedRecs) {
      const reasoningForRec = rec.reasoning;
      let animeData: JikanAnimeData | undefined = cachedMap.get(rec.mal_id);

      // 캐시 미스: Jikan API 호출
      if (!animeData) {
        try {
          const fetched = await this.fetchFromJikan(rec.mal_id);
          if (fetched) {
            animeData = fetched;
            // 캐시에 저장 (upsert)
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
    data: JikanAnimeData,
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
      url: data.url,
      aiReasoning,
    };
  }
}
