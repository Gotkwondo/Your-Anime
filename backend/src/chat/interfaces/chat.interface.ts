export interface AnimeRecommendation {
  malId: number;
  title: string;
  titleJapanese: string | null;
  imageUrl: string | null;
  score: number | null;
  genres: string[];
  episodes: number | null;
  status: string | null;
  synopsis: string | null;
  synopsisKo: string | null;
  url: string;
  aiReasoning: string;
}

export interface ChatData {
  conversationId: string;
  message: string;
  messageType: 'chat' | 'recommendation';
}

export interface ChatResponse {
  data: ChatData;
  isOrganized: boolean;
  organizedData?: AnimeRecommendation[];
}

export interface JikanAnimeData {
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
