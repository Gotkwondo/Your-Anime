// Anime types based on PRD Section 2.3 - F2
export interface AnimeRecommendation {
  malId: number;
  title: string;
  titleJapanese: string;
  imageUrl: string;
  score: number;
  genres: string[];
  episodes: number;
  status: 'Finished Airing' | 'Currently Airing' | 'Not yet aired';
  synopsis: string;
  url: string; // MyAnimeList URL
  aiReasoning?: string; // Why AI recommended this
}

export interface AnimeSearchResult {
  malId: number;
  title: string;
  imageUrl: string;
  year: number;
}
