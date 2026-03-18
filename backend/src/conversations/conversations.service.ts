import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';

export type PersonaType = 'sommelier' | 'cafe_owner' | 'otaku_friend';

interface ConversationListRow {
  id: string;
  title: string | null;
  persona_type: string;
  created_at: string;
  updated_at: string;
}

interface MessageConversationIdRow {
  conversation_id: string;
}

interface NewConversationRow {
  id: string;
  persona_type: string;
  title: string | null;
  created_at: string;
}

interface ConversationDetailRow {
  id: string;
  title: string | null;
  persona_type: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface AnimeReferenceRow {
  malId?: number;
  mal_id?: number; // 구버전 호환
  title: string;
  titleJapanese?: string | null;
  imageUrl?: string | null;
  score?: number | null;
  genres?: string[];
  episodes?: number | null;
  status?: string | null;
  synopsis?: string | null;
  synopsisKo?: string | null;
  url?: string | null;
  aiReasoning?: string | null;
}

interface AnimeCacheRow {
  mal_id: number;
  data: {
    title: string;
    title_japanese: string | null;
    images: {
      jpg: { large_image_url: string | null; image_url: string | null };
    };
    score: number | null;
    genres: Array<{ name: string }>;
    episodes: number | null;
    status: string | null;
    synopsis: string | null;
    synopsis_ko?: string | null;
    url: string;
  };
}

interface MessageRow {
  id: string;
  role: string;
  content: string;
  anime_references: AnimeReferenceRow[];
  created_at: string;
}

interface ConversationOwnerRow {
  id: string;
  user_id: string;
}

export interface ConversationListItem {
  id: string;
  title: string | null;
  personaType: PersonaType;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ConversationDetail {
  id: string;
  title: string | null;
  personaType: PersonaType;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    role: string;
    content: string;
    animeReferences: object[];
    createdAt: string;
  }>;
}

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * GET /api/conversations - 사용자의 대화 목록 조회 (페이지네이션)
   */
  async listConversations(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<{
    conversations: ConversationListItem[];
    total: number;
    hasMore: boolean;
  }> {
    const supabase = this.supabaseService.getServiceRoleClient();

    // 전체 카운트 조회
    const { count } = await supabase
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    const total = count ?? 0;

    // 대화 목록 조회
    const { data: rawConversations, error } = await supabase
      .from('conversations')
      .select('id, title, persona_type, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      this.logger.error('대화 목록 조회 실패', error);
      throw new BadRequestException({
        success: false,
        error: '대화 목록을 불러오는 중 오류가 발생했습니다.',
        statusCode: 400,
      });
    }

    const conversations =
      (rawConversations as unknown as ConversationListRow[] | null) ?? [];

    // 각 대화의 메시지 카운트 조회
    const conversationIds = conversations.map((c) => c.id);
    let messageCounts: Record<string, number> = {};

    if (conversationIds.length > 0) {
      const { data: rawCountData } = await supabase
        .from('messages')
        .select('conversation_id')
        .in('conversation_id', conversationIds);

      const countData =
        (rawCountData as unknown as MessageConversationIdRow[] | null) ?? [];
      messageCounts = countData.reduce(
        (acc, msg) => {
          acc[msg.conversation_id] = (acc[msg.conversation_id] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );
    }

    const result: ConversationListItem[] = conversations.map((conv) => ({
      id: conv.id,
      title: conv.title,
      personaType: conv.persona_type as PersonaType,
      createdAt: conv.created_at,
      updatedAt: conv.updated_at,
      messageCount: messageCounts[conv.id] ?? 0,
    }));

    return {
      conversations: result,
      total,
      hasMore: offset + limit < total,
    };
  }

  /**
   * POST /api/conversations - 새 대화 생성
   */
  async createConversation(
    userId: string,
    personaType: PersonaType,
    title?: string,
  ): Promise<{
    id: string;
    personaType: PersonaType;
    title: string | null;
    createdAt: string;
  }> {
    const validPersonaTypes: PersonaType[] = [
      'sommelier',
      'cafe_owner',
      'otaku_friend',
    ];
    if (!validPersonaTypes.includes(personaType)) {
      throw new BadRequestException({
        success: false,
        error:
          'personaType은 sommelier, cafe_owner, otaku_friend 중 하나여야 합니다.',
        statusCode: 400,
      });
    }

    const supabase = this.supabaseService.getServiceRoleClient();

    const { data: rawData, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        persona_type: personaType,
        title: title ?? null,
      })
      .select('id, persona_type, title, created_at')
      .single();

    const data = rawData as unknown as NewConversationRow | null;

    if (error || !data) {
      this.logger.error('대화 생성 실패', JSON.stringify(error));
      throw new BadRequestException({
        success: false,
        error: `대화를 생성하는 중 오류가 발생했습니다. [${error?.code ?? 'UNKNOWN'}] ${error?.message ?? ''}`,
        statusCode: 400,
      });
    }

    return {
      id: data.id,
      personaType: data.persona_type as PersonaType,
      title: data.title,
      createdAt: data.created_at,
    };
  }

  /**
   * GET /api/conversations/:id - 특정 대화 + 전체 메시지 조회
   */
  async getConversation(
    conversationId: string,
    userId: string,
  ): Promise<ConversationDetail> {
    const supabase = this.supabaseService.getServiceRoleClient();

    const { data: rawConversation, error: convError } = await supabase
      .from('conversations')
      .select('id, title, persona_type, created_at, updated_at, user_id')
      .eq('id', conversationId)
      .single();

    const conversation =
      rawConversation as unknown as ConversationDetailRow | null;

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

    const { data: rawMessages, error: msgError } = await supabase
      .from('messages')
      .select('id, role, content, anime_references, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    const messages = (rawMessages as unknown as MessageRow[] | null) ?? [];

    if (msgError) {
      this.logger.error('메시지 조회 실패', msgError);
      throw new BadRequestException({
        success: false,
        error: '메시지를 불러오는 중 오류가 발생했습니다.',
        statusCode: 400,
      });
    }

    // anime_references에 imageUrl이 없는 경우 anime_cache에서 보완
    const allRefs = messages.flatMap((m) => m.anime_references ?? []);
    const missingIds = allRefs
      .filter((r) => !r.imageUrl)
      .map((r) => r.malId ?? r.mal_id)
      .filter((id): id is number => id != null);

    const cacheMap = new Map<number, AnimeCacheRow['data']>();
    if (missingIds.length > 0) {
      const { data: cacheRows } = await supabase
        .from('anime_cache')
        .select('mal_id, data')
        .in('mal_id', missingIds);

      const typedCacheRows =
        (cacheRows as unknown as AnimeCacheRow[] | null) ?? [];
      typedCacheRows.forEach((row) => {
        cacheMap.set(row.mal_id, row.data);
      });
    }

    const enrichRef = (r: AnimeReferenceRow): object => {
      const id = r.malId ?? r.mal_id;
      if (r.imageUrl || !id) return r;
      const cached = cacheMap.get(id);
      if (!cached) return r;
      return {
        malId: id,
        title: r.title ?? cached.title,
        titleJapanese: r.titleJapanese ?? cached.title_japanese,
        imageUrl:
          cached.images?.jpg?.large_image_url ??
          cached.images?.jpg?.image_url ??
          null,
        score: r.score ?? cached.score,
        genres: r.genres ?? (cached.genres ?? []).map((g) => g.name),
        episodes: r.episodes ?? cached.episodes,
        status: r.status ?? cached.status,
        synopsis: r.synopsis ?? cached.synopsis,
        synopsisKo: r.synopsisKo ?? cached.synopsis_ko ?? null,
        url: r.url ?? cached.url,
        aiReasoning: r.aiReasoning ?? null,
      };
    };

    return {
      id: conversation.id,
      title: conversation.title,
      personaType: conversation.persona_type as PersonaType,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
      messages: messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        animeReferences: (msg.anime_references ?? []).map(enrichRef),
        createdAt: msg.created_at,
      })),
    };
  }

  /**
   * DELETE /api/conversations/:id - 대화 삭제
   */
  async deleteConversation(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const supabase = this.supabaseService.getServiceRoleClient();

    // 소유권 확인
    const { data: rawConv, error: findError } = await supabase
      .from('conversations')
      .select('id, user_id')
      .eq('id', conversationId)
      .single();

    const conversation = rawConv as unknown as ConversationOwnerRow | null;

    if (findError || !conversation) {
      throw new NotFoundException({
        success: false,
        error: '해당 대화를 찾을 수 없습니다.',
        statusCode: 404,
      });
    }

    if (conversation.user_id !== userId) {
      throw new ForbiddenException({
        success: false,
        error: '이 대화를 삭제할 권한이 없습니다.',
        statusCode: 403,
      });
    }

    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (deleteError) {
      this.logger.error('대화 삭제 실패', deleteError);
      throw new BadRequestException({
        success: false,
        error: '대화를 삭제하는 중 오류가 발생했습니다.',
        statusCode: 400,
      });
    }
  }
}
