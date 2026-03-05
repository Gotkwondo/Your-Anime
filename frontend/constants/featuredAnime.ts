import { AnimeRecommendation } from '@/types/anime';

// 추후 Backend /api/anime/search 연동 예정 (현재는 정적 데이터)
export const FEATURED_ANIME: AnimeRecommendation[] = [
  {
    malId: 5114,
    title: 'Fullmetal Alchemist: Brotherhood',
    titleJapanese: '鋼の錬金術師 FULLMETAL ALCHEMIST',
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1223/96541.jpg',
    score: 9.1,
    genres: ['Action', 'Adventure', 'Drama', 'Fantasy'],
    episodes: 64,
    status: 'Finished Airing',
    synopsis:
      "Two brothers search for a Philosopher's Stone after an attempt to revive their deceased mother goes awry and leaves them in damaged physical forms.",
    url: 'https://myanimelist.net/anime/5114',
  },
  {
    malId: 9253,
    title: 'Steins;Gate',
    titleJapanese: 'STEINS;GATE',
    imageUrl: 'https://cdn.myanimelist.net/images/anime/5/73199.jpg',
    score: 9.0,
    genres: ['Sci-Fi', 'Thriller', 'Drama'],
    episodes: 24,
    status: 'Finished Airing',
    synopsis:
      'A group of friends discover a way to send messages to the past, but changing history has unexpected consequences.',
    url: 'https://myanimelist.net/anime/9253',
  },
  {
    malId: 1535,
    title: 'Death Note',
    titleJapanese: 'DEATH NOTE',
    imageUrl: 'https://cdn.myanimelist.net/images/anime/9/9453.jpg',
    score: 8.6,
    genres: ['Mystery', 'Psychological', 'Supernatural', 'Thriller'],
    episodes: 37,
    status: 'Finished Airing',
    synopsis:
      'A high school student discovers a supernatural notebook that allows him to kill anyone by writing their name in it.',
    url: 'https://myanimelist.net/anime/1535',
  },
  {
    malId: 44511,
    title: 'Chainsaw Man',
    titleJapanese: 'チェンソーマン',
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1806/126216.jpg',
    score: 8.6,
    genres: ['Action', 'Fantasy', 'Horror'],
    episodes: 12,
    status: 'Finished Airing',
    synopsis:
      'A young man becomes a devil hunter after merging with his pet chainsaw devil to pay off his debts.',
    url: 'https://myanimelist.net/anime/44511',
  },
  {
    malId: 28977,
    title: 'Gintama°',
    titleJapanese: '銀魂°',
    imageUrl: 'https://cdn.myanimelist.net/images/anime/3/72078.jpg',
    score: 9.0,
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    episodes: 51,
    status: 'Finished Airing',
    synopsis:
      'In an alternate-history Edo period overrun by aliens, a samurai works odd jobs with his friends.',
    url: 'https://myanimelist.net/anime/28977',
  },
  {
    malId: 52991,
    title: 'Sousou no Frieren',
    titleJapanese: '葬送のフリーレン',
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1015/138006.jpg',
    score: 9.3,
    genres: ['Adventure', 'Drama', 'Fantasy'],
    episodes: 28,
    status: 'Finished Airing',
    synopsis:
      "An elf mage reflects on her journey with heroes after their adventure ended, exploring the meaning of time and relationships.",
    url: 'https://myanimelist.net/anime/52991',
  },
];
