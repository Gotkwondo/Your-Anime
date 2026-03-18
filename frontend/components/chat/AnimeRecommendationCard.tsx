'use client';

import { useState } from 'react';
import { AnimeReference } from '@/types/conversation';

interface AnimeRecommendationCardProps {
  anime: AnimeReference;
  onSelect: (anime: AnimeReference) => void;
  variant?: 'compact' | 'full';
}

export function AnimeRecommendationCard({
  anime,
  onSelect,
  variant = 'compact',
}: AnimeRecommendationCardProps) {
  const [imageError, setImageError] = useState(false);

  const displayScore =
    anime.score != null ? anime.score.toFixed(1) : 'N/A';

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={() => onSelect(anime)}
        className="w-full text-left focus:outline-none"
        aria-label={`${anime.title} 상세 보기`}
      >
        <div className="flex gap-3 pt-2.5">
          {/* 왼쪽 이미지 */}
          <div
            className="w-28 h-36 flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            {anime.imageUrl && !imageError ? (
              <img
                src={anime.imageUrl}
                alt={anime.title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <ImagePlaceholder />
            )}
          </div>

          {/* 오른쪽 정보 */}
          <div className="flex-1 min-w-0 space-y-1.5 py-0.5">
            {/* 제목 */}
            <p
              className="text-sm font-bold leading-tight"
              style={{ color: '#fff' }}
              title={anime.title}
            >
              {anime.title}
            </p>

            {/* 점수 */}
            <div className="flex items-center gap-1">
              <StarIcon />
              <span className="text-xs font-medium" style={{ color: '#03f7b5' }}>
                {displayScore}
              </span>
            </div>

            {/* 장르 (최대 3개) */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {anime.genres.slice(0, 3).map((genre) => (
                  <span
                    key={genre}
                    className="text-xs px-1.5 py-0.5 rounded-md"
                    style={{
                      background: 'rgba(3,247,181,0.1)',
                      color: '#03f7b5',
                    }}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* AI Reasoning (전체 표시, line-clamp-4) */}
            {anime.aiReasoning && (
              <p
                className="text-xs leading-snug line-clamp-4"
                style={{ color: '#85868b' }}
              >
                {anime.aiReasoning}
              </p>
            )}
          </div>
        </div>
      </button>
    );
  }

  // compact variant
  return (
    <button
      type="button"
      onClick={() => onSelect(anime)}
      className="flex-shrink-0 w-40 text-left rounded-xl overflow-hidden transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#03f7b5]"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = '#03f7b5';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor =
          'rgba(255,255,255,0.08)';
      }}
      aria-label={`${anime.title} 상세 보기`}
    >
      {/* Thumbnail */}
      <div
        className="w-full h-24 overflow-hidden flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        {anime.imageUrl && !imageError ? (
          <img
            src={anime.imageUrl}
            alt={anime.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>

      {/* Body */}
      <div className="p-2 space-y-1">
        {/* Title */}
        <p
          className="text-xs font-semibold leading-tight truncate"
          style={{ color: '#fff' }}
          title={anime.title}
        >
          {anime.title}
        </p>

        {/* Score */}
        <div className="flex items-center gap-1">
          <StarIcon />
          <span className="text-xs font-medium" style={{ color: '#03f7b5' }}>
            {displayScore}
          </span>
        </div>

        {/* AI Reasoning */}
        {anime.aiReasoning && (
          <p
            className="text-xs leading-snug line-clamp-2"
            style={{ color: '#85868b' }}
          >
            {anime.aiReasoning}
          </p>
        )}
      </div>
    </button>
  );
}

function ImagePlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center gap-1 w-full h-full">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        style={{ color: 'rgba(255,255,255,0.2)' }}
      >
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
        <path
          d="M3 15l5-5 4 4 3-3 6 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
        No image
      </span>
    </div>
  );
}

function StarIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="#03f7b5"
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
