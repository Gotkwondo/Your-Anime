import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';
const JIKAN_RATE_LIMIT_DELAY_MS = 400;

export interface AnimeData {
  malId: number;
  title: string;
  titleJapanese: string | null;
  imageUrl: string | null;
  score: number | null;
  genres: string[];
  episodes: number | null;
  status: string | null;
  synopsis: string | null;
  url: string;
  cachedAt?: string;
}

interface JikanAnimeData {
  mal_id: number;
  title: string;
  title_japanese: string | null;
  images: {
    jpg: {
      image_url: string | null;
      large_image_url: string | null;
    };
  };
  score: number | null;
  genres: Array<{ name: string }>;
  episodes: number | null;
  status: string | null;
  synopsis: string | null;
  url: string;
}

interface JikanSearchResult {
  data: JikanAnimeData[];
  pagination: {
    items: {
      total: number;
    };
  };
}

interface AnimeCacheRow {
  mal_id: number;
  title: string;
  title_japanese: string | null;
  data: JikanAnimeData;
  cached_at: string;
  expires_at: string;
}

@Injectable()
export class AnimeService {
  private readonly logger = new Logger(AnimeService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * GET /api/anime/search?q={query}&limit=5
   * 애니메이션 검색 (캐시 우선, Jikan API 폴백)
   */
  async searchAnime(
    query: string,
    limit: number = 5,
  ): Promise<{ results: AnimeData[]; total: number }> {
    // 쿼리 길이 검증
    if (query.length < 2) {
      return { results: [], total: 0 };
    }

    const supabase = this.supabaseService.getServiceRoleClient();

    // 1. 캐시에서 제목 검색 (ilike로 부분 일치)
    const { data: rawCachedResults } = await supabase
      .from('anime_cache')
      .select('mal_id, title, title_japanese, data, cached_at')
      .or(`title.ilike.%${query}%,title_japanese.ilike.%${query}%`)
      .gt('expires_at', new Date().toISOString())
      .limit(limit);

    const cachedResults = rawCachedResults as unknown as AnimeCacheRow[] | null;

    if (cachedResults && cachedResults.length >= limit) {
      const results = cachedResults.map((item) =>
        this.mapCachedToAnimeData(item.data, item.cached_at),
      );
      return { results, total: results.length };
    }

    // 2. Jikan API 검색
    try {
      await new Promise((resolve) =>
        setTimeout(resolve, JIKAN_RATE_LIMIT_DELAY_MS),
      );

      const url = new URL(`${JIKAN_BASE_URL}/anime`);
      url.searchParams.set('q', query);
      url.searchParams.set('limit', String(Math.min(limit, 20)));
      url.searchParams.set('order_by', 'members');
      url.searchParams.set('sort', 'desc');

      const response = await fetch(url.toString());

      if (!response.ok) {
        this.logger.warn(`Jikan API 검색 실패: ${response.status}`);
        // 캐시 결과라도 반환
        if (cachedResults && cachedResults.length > 0) {
          const results = cachedResults.map((item) =>
            this.mapCachedToAnimeData(item.data, item.cached_at),
          );
          return { results, total: results.length };
        }
        return { results: [], total: 0 };
      }

      const json = (await response.json()) as JikanSearchResult;
      const animeList = json.data ?? [];
      const total = json.pagination?.items?.total ?? animeList.length;

      // 3. 검색 결과를 캐시에 저장 (upsert)
      if (animeList.length > 0) {
        const cacheInserts = animeList.map((anime) => ({
          mal_id: anime.mal_id,
          title: anime.title,
          title_english: null,
          title_japanese: anime.title_japanese,
          data: anime,
          cached_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 검색 결과는 24시간
        }));

        await supabase
          .from('anime_cache')
          .upsert(cacheInserts, { onConflict: 'mal_id' });
      }

      const results = animeList.map((anime) => this.mapJikanToAnimeData(anime));
      return { results, total };
    } catch (error) {
      this.logger.error('Jikan API 검색 오류', error);
      if (cachedResults && cachedResults.length > 0) {
        const results = cachedResults.map((item) =>
          this.mapCachedToAnimeData(item.data, item.cached_at),
        );
        return { results, total: results.length };
      }
      return { results: [], total: 0 };
    }
  }

  /**
   * GET /api/anime/:id
   * 단건 애니메이션 조회 (캐시 우선, Jikan API 폴백)
   */
  async getAnimeById(malId: number): Promise<AnimeData> {
    const supabase = this.supabaseService.getServiceRoleClient();

    // 1. 캐시 조회
    const { data: rawCached } = await supabase
      .from('anime_cache')
      .select('mal_id, data, cached_at, expires_at')
      .eq('mal_id', malId)
      .single();

    const cached = rawCached as unknown as AnimeCacheRow | null;

    if (cached && new Date(cached.expires_at) > new Date()) {
      return this.mapCachedToAnimeData(cached.data, cached.cached_at);
    }

    // 2. Jikan API 호출
    try {
      await new Promise((resolve) =>
        setTimeout(resolve, JIKAN_RATE_LIMIT_DELAY_MS),
      );

      const response = await fetch(`${JIKAN_BASE_URL}/anime/${malId}`);

      if (response.status === 404) {
        throw new NotFoundException({
          success: false,
          error: `mal_id ${malId}에 해당하는 애니메이션을 찾을 수 없습니다.`,
          statusCode: 404,
        });
      }

      if (!response.ok) {
        throw new Error(`Jikan API 응답 오류: ${response.status}`);
      }

      const json = (await response.json()) as { data: JikanAnimeData };
      const animeData = json.data;

      // 3. 캐시에 저장
      await supabase.from('anime_cache').upsert({
        mal_id: animeData.mal_id,
        title: animeData.title,
        title_english: null,
        title_japanese: animeData.title_japanese,
        data: animeData,
        cached_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      });

      return this.mapJikanToAnimeData(animeData);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Jikan API 단건 조회 오류 (mal_id: ${malId})`, error);
      throw new NotFoundException({
        success: false,
        error: '애니메이션 정보를 불러오는 중 오류가 발생했습니다.',
        statusCode: 404,
      });
    }
  }

  private mapJikanToAnimeData(data: JikanAnimeData): AnimeData {
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
    };
  }

  private mapCachedToAnimeData(
    data: JikanAnimeData,
    cachedAt: string,
  ): AnimeData {
    return {
      ...this.mapJikanToAnimeData(data),
      cachedAt,
    };
  }
}
