import { AnimeRecommendation } from '@/types/anime';
import { AnimeCard } from './AnimeCard';

interface AnimeGridProps {
  animes: AnimeRecommendation[];
  emptyMessage?: string;
}

export function AnimeGrid({
  animes,
  emptyMessage = 'No anime recommendations yet',
}: AnimeGridProps) {
  if (animes.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {animes.map((anime) => (
        <AnimeCard key={anime.malId} anime={anime} />
      ))}
    </div>
  );
}
