import Image from 'next/image';
import { AnimeRecommendation } from '@/types/anime';
import { GenreTag } from './GenreTag';
import { RatingDisplay } from './RatingDisplay';

interface AnimeCardProps {
  anime: AnimeRecommendation;
}

export function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <div
      className="overflow-hidden rounded-xl transition-all duration-300 group"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(3,247,181,0.25)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
    >
      {/* Anime Poster */}
      <div className="relative h-72 w-full bg-muted overflow-hidden">
        <Image
          src={anime.imageUrl}
          alt={anime.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #04050e 0%, transparent 60%)' }} />
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold line-clamp-1 transition-colors text-white group-hover:text-[#03f7b5]">
            {anime.title}
          </h3>
          <p className="text-xs text-[#85868b] line-clamp-1 mt-0.5">
            {anime.titleJapanese}
          </p>
        </div>

        {/* Rating */}
        <RatingDisplay score={anime.score} />

        {/* Info */}
        <div className="flex gap-2 text-xs text-[#85868b]">
          <span>{anime.episodes} episodes</span>
          <span>·</span>
          <span>{anime.status}</span>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-2">
          {anime.genres.slice(0, 4).map((genre) => (
            <GenreTag key={genre} genre={genre} />
          ))}
        </div>

        {/* Synopsis */}
        <p className="text-sm text-[#85868b] line-clamp-3">
          {anime.synopsis}
        </p>

        {/* AI Reasoning (if available) */}
        {anime.aiReasoning && (
          <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: '#03f7b5' }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#03f7b5' }} />
              Why this anime?
            </p>
            <p className="text-xs text-[#85868b] line-clamp-2">
              {anime.aiReasoning}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <a
            href={anime.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-2 text-xs font-semibold rounded-[5px] transition-all hover:opacity-90"
            style={{ background: '#03f7b5', color: '#04050e' }}
          >
            More Info
          </a>
          <button
            className="flex-1 py-2 text-xs font-semibold rounded-[5px] transition-all"
            style={{
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#cecfd1',
              background: 'transparent',
            }}
          >
            + Watchlist
          </button>
        </div>
      </div>
    </div>
  );
}
